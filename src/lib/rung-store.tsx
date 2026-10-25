"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onBridge, postBridge } from "@/lib/bridge";
import { saveAccount } from "@/lib/accounts";
import {
  PRO_YOU_ID,
  YOU_ID,
  comments as seedComments,
  demos as seedDemos,
  ladderPros,
  majorsForFields,
  personById,
  tierForPoints,
  type Comment,
  type Demo,
  type Tier,
} from "@/lib/rung-data";

export type SessionKind = "student" | "professional";

/** What onboarding collects; saved per email so "Log in" can restore it. */
export type SignupProfile = {
  name: string;
  email: string;
  college?: string;
  major?: string;
  exploreMajors?: string[];
  profession?: string;
  company?: string;
  proFields?: string[];
  /** Career rung, 1 (early) – 4 (leadership) */
  level?: number;
};

type Booking = {
  id: string;
  shopItemId: string;
  mentorId: string;
  pointsSpent: number;
  minutes: number;
  at: number;
};

type Dm = {
  id: string;
  toId: string;
  text: string;
  at: number;
};

export type GithubProfile = {
  login: string;
  name: string | null;
  score: number;
  repoCount: number;
  originalCount: number;
  languages: string[];
  highlights: string[];
  factors: { label: string; points: number }[];
  scoredAt: number;
};

/** Live activity from the other window, shown as a toast */
export type InboxItem = {
  id: string;
  kind: "feedback" | "view" | "try" | "helpful" | "reply" | "accepted";
  fromName: string;
  text?: string;
  demoId?: string;
  /** e.g. "+5" — the reward this event earned */
  reward?: string;
};

export type AskStatus = "pending" | "accepted";

/** Credits a pro spends to ask someone a rung up */
export const ASK_UP_COST = 10;
const seedCommentIds = new Set(seedComments.map((c) => c.id));

type RungContextValue = {
  hydrated: boolean;
  session: SessionKind | null;
  /** `bonus` = welcome points added on sign-up */
  login: (kind: SessionKind, profile?: SignupProfile, bonus?: number) => void;
  logout: () => void;
  points: number;
  githubRating: number;
  githubProfile: GithubProfile | null;
  tier: Tier;
  liked: Set<string>;
  remixed: Set<string>;
  matched: string[];
  passed: string[];
  demos: Demo[];
  comments: Comment[];
  bookings: Booking[];
  joinedProjects: string[];
  joinedSponsors: string[];
  question: string;
  collegeFilter: string;
  setCollegeFilter: (c: string) => void;
  myMajor: string;
  setMyMajor: (m: string) => void;
  /** When true, Feed / Reels / Match / Stories only show myMajor */
  majorOnly: boolean;
  setMajorOnly: (v: boolean) => void;
  /** Other majors a student opted into seeing alongside their own */
  exploreMajors: string[];
  setExploreMajors: (m: string[]) => void;
  /** Majors a professional sees, from their fields of expertise */
  proMajors: string[];
  proFields: string[];
  /** Pro career rung, 1–4 */
  proLevel: number;
  setProFields: (fieldIds: string[]) => void;
  inbox: InboxItem[];
  dismissInbox: (id: string) => void;
  /** Student: feedback ids already seen on My projects */
  seenFeedback: string[];
  markFeedbackSeen: (ids: string[]) => void;
  helpfulIds: string[];
  markHelpful: (commentId: string) => void;
  replies: Record<string, string>;
  replyToFeedback: (commentId: string, text: string) => void;
  /** Pro: tell the student's window you opened or tried their demo */
  notifyDemo: (demoId: string, type: "view" | "try") => void;
  credits: number;
  helpfulReceived: number;
  feedbackSent: number;
  asks: Record<string, AskStatus>;
  askUp: (ladderProId: string) => boolean;
  connectedPros: string[];
  toggleConnectPro: (ladderProId: string) => void;
  feedbackMinsToday: number;
  feedbackGoalMins: number;
  logFeedbackMinutes: (mins: number) => void;
  messages: Dm[];
  sendMessage: (toId: string, text: string) => void;
  you: ReturnType<typeof personById>;
  toggleLike: (demoId: string) => void;
  addFeedback: (demoId: string, text: string) => void;
  remixDemo: (demoId: string) => void;
  swipeMatch: (cardId: string, personId: string) => void;
  swipePass: (cardId: string) => void;
  redeem: (
    shopItemId: string,
    mentorId: string,
    points: number,
    minutes: number,
  ) => boolean;
  joinProject: (projectId: string, pointsOnComplete: number) => void;
  joinSponsor: (sponsorId: string) => void;
  setQuestion: (q: string) => void;
  applyGithubAiBump: () => void;
  applyGithubScore: (profile: GithubProfile) => void;
  clearGithubProfile: () => void;
};

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const RungContext = createContext<RungContextValue | null>(null);
const STORAGE_KEY = "cc-demo-v2";
/** Per-tab, so a student window and a pro window can run side by side */
const SESSION_KEY = "cc-session";
const stateKey = (s: SessionKind) => `${STORAGE_KEY}:${s}`;

export function RungProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionKind | null>(null);
  const [points, setPoints] = useState(28);
  const [githubRating, setGithubRating] = useState(42);
  const [githubProfile, setGithubProfile] = useState<GithubProfile | null>(
    null,
  );
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  const [remixed, setRemixed] = useState<Set<string>>(() => new Set());
  const [matched, setMatched] = useState<string[]>([]);
  const [passed, setPassed] = useState<string[]>([]);
  const [demos, setDemos] = useState(seedDemos);
  const [comments, setComments] = useState(seedComments);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<string[]>([]);
  const [joinedSponsors, setJoinedSponsors] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [myMajor, setMyMajor] = useState("Biology");
  const [majorOnly, setMajorOnly] = useState(true);
  const [profile, setProfile] = useState<SignupProfile | null>(null);
  const [exploreMajors, setExploreMajors] = useState<string[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [demoDeltas, setDemoDeltas] = useState<
    Record<string, { tries: number; proViews: number }>
  >({});
  const [seenFeedback, setSeenFeedback] = useState<string[]>([]);
  const [helpfulIds, setHelpfulIds] = useState<string[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [credits, setCredits] = useState(ASK_UP_COST);
  const [helpfulReceived, setHelpfulReceived] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(0);
  const [asks, setAsks] = useState<Record<string, AskStatus>>({});
  const [connectedPros, setConnectedPros] = useState<string[]>([]);
  const [feedbackMinsToday, setFeedbackMinsToday] = useState(0);
  const [messages, setMessages] = useState<Dm[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const feedbackGoalMins = 30;

  const youId = session === "professional" ? PRO_YOU_ID : YOU_ID;
  const baseYou = personById(youId);
  const you = useMemo(() => {
    const named = profile
      ? {
          ...baseYou,
          name: profile.name,
          avatar: initialsOf(profile.name) || baseYou.avatar,
          company: profile.company ?? baseYou.company,
          college: profile.college ?? baseYou.college,
          workforceRole: profile.profession ?? baseYou.workforceRole,
        }
      : baseYou;
    return session === "student" ? { ...named, major: myMajor } : named;
  }, [baseYou, myMajor, session, profile]);
  const proMajors = useMemo(
    () => majorsForFields(profile?.proFields ?? []),
    [profile],
  );
  const tier = tierForPoints(points);

  useEffect(() => {
    try {
      const tabSession = sessionStorage.getItem(SESSION_KEY);
      const restored =
        tabSession === "student" || tabSession === "professional"
          ? tabSession
          : null;
      const raw = restored ? localStorage.getItem(stateKey(restored)) : null;
      if (restored) setSession(restored);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (typeof parsed.points === "number") setPoints(parsed.points);
        if (typeof parsed.githubRating === "number")
          setGithubRating(parsed.githubRating);
        if (parsed.githubProfile && typeof parsed.githubProfile === "object") {
          setGithubProfile(parsed.githubProfile as GithubProfile);
        }
        if (Array.isArray(parsed.liked))
          setLiked(new Set(parsed.liked as string[]));
        if (Array.isArray(parsed.remixed))
          setRemixed(new Set(parsed.remixed as string[]));
        if (Array.isArray(parsed.matched))
          setMatched(parsed.matched as string[]);
        if (Array.isArray(parsed.passed)) setPassed(parsed.passed as string[]);
        if (Array.isArray(parsed.bookings))
          setBookings(parsed.bookings as Booking[]);
        if (Array.isArray(parsed.joinedProjects))
          setJoinedProjects(parsed.joinedProjects as string[]);
        if (Array.isArray(parsed.joinedSponsors))
          setJoinedSponsors(parsed.joinedSponsors as string[]);
        if (typeof parsed.collegeFilter === "string")
          setCollegeFilter(parsed.collegeFilter);
        if (typeof parsed.myMajor === "string") setMyMajor(parsed.myMajor);
        if (typeof parsed.majorOnly === "boolean")
          setMajorOnly(parsed.majorOnly);
        if (parsed.profile && typeof parsed.profile === "object")
          setProfile(parsed.profile as SignupProfile);
        if (Array.isArray(parsed.exploreMajors))
          setExploreMajors(parsed.exploreMajors as string[]);
        if (typeof parsed.feedbackMinsToday === "number")
          setFeedbackMinsToday(parsed.feedbackMinsToday);
        if (Array.isArray(parsed.messages))
          setMessages(parsed.messages as Dm[]);
        if (Array.isArray(parsed.extraComments))
          setComments([
            ...seedComments,
            ...(parsed.extraComments as Comment[]),
          ]);
        if (parsed.demoDeltas && typeof parsed.demoDeltas === "object")
          setDemoDeltas(parsed.demoDeltas as typeof demoDeltas);
        if (Array.isArray(parsed.seenFeedback))
          setSeenFeedback(parsed.seenFeedback as string[]);
        if (Array.isArray(parsed.helpfulIds))
          setHelpfulIds(parsed.helpfulIds as string[]);
        if (parsed.replies && typeof parsed.replies === "object")
          setReplies(parsed.replies as Record<string, string>);
        if (typeof parsed.credits === "number") setCredits(parsed.credits);
        if (typeof parsed.helpfulReceived === "number")
          setHelpfulReceived(parsed.helpfulReceived);
        if (typeof parsed.feedbackSent === "number")
          setFeedbackSent(parsed.feedbackSent);
        if (parsed.asks && typeof parsed.asks === "object")
          setAsks(parsed.asks as Record<string, AskStatus>);
        if (Array.isArray(parsed.connectedPros))
          setConnectedPros(parsed.connectedPros as string[]);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, session);
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    if (!session) return;
    localStorage.setItem(
      stateKey(session),
      JSON.stringify({
        points,
        githubRating,
        githubProfile,
        liked: [...liked],
        remixed: [...remixed],
        matched,
        passed,
        bookings,
        joinedProjects,
        joinedSponsors,
        collegeFilter,
        myMajor,
        majorOnly,
        profile,
        exploreMajors,
        feedbackMinsToday,
        messages,
        extraComments: comments.filter((c) => !seedCommentIds.has(c.id)),
        demoDeltas,
        seenFeedback,
        helpfulIds,
        replies,
        credits,
        helpfulReceived,
        feedbackSent,
        asks,
        connectedPros,
      }),
    );
  }, [
    hydrated,
    session,
    points,
    githubRating,
    githubProfile,
    liked,
    remixed,
    matched,
    passed,
    bookings,
    joinedProjects,
    joinedSponsors,
    collegeFilter,
    myMajor,
    majorOnly,
    profile,
    exploreMajors,
    feedbackMinsToday,
    messages,
    comments,
    demoDeltas,
    seenFeedback,
    helpfulIds,
    replies,
    credits,
    helpfulReceived,
    feedbackSent,
    asks,
    connectedPros,
  ]);

  const login = useCallback(
    (kind: SessionKind, p?: SignupProfile, bonus = 0) => {
      setSession(kind);
      setProfile(p ?? null);
      setInbox([]);
      setComments(seedComments);
      setDemoDeltas({});
      setSeenFeedback([]);
      setHelpfulIds([]);
      setReplies({});
      setCredits(ASK_UP_COST);
      setHelpfulReceived(0);
      setFeedbackSent(0);
      setAsks({});
      setConnectedPros([]);
      if (kind === "student") {
        setPoints(28 + bonus);
        setGithubRating(42);
        setGithubProfile(null);
        setCollegeFilter(p?.college ?? "Ohio State");
        setMyMajor(p?.major ?? "Biology");
        setExploreMajors(p?.exploreMajors ?? []);
        setMajorOnly(true);
      } else {
        setPoints(bonus);
        setGithubRating(94);
        setGithubProfile(null);
        setCollegeFilter("Ohio State");
        setFeedbackMinsToday(12);
      }
    },
    [],
  );

  // Keep the saved account in step with edits made after onboarding
  useEffect(() => {
    if (!hydrated || !session || !profile) return;
    saveAccount(
      session,
      session === "student"
        ? { ...profile, major: myMajor, exploreMajors }
        : profile,
    );
  }, [hydrated, session, profile, myMajor, exploreMajors]);

  const setProFields = useCallback((fieldIds: string[]) => {
    setProfile((prev) => (prev ? { ...prev, proFields: fieldIds } : prev));
  }, []);

  const commentsRef = useRef(comments);
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  const pushInbox = useCallback((item: Omit<InboxItem, "id">) => {
    setInbox((prev) => [
      ...prev,
      { ...item, id: `ib-${Date.now()}-${prev.length}` },
    ]);
  }, []);

  const bumpDemo = useCallback((demoId: string, key: "tries" | "proViews") => {
    setDemoDeltas((prev) => {
      const cur = prev[demoId] ?? { tries: 0, proViews: 0 };
      return { ...prev, [demoId]: { ...cur, [key]: cur[key] + 1 } };
    });
  }, []);

  // Live link with the other window: pros act on "your" demo, students react
  useEffect(() => {
    if (!session) return;
    return onBridge((e) => {
      if (session === "student") {
        if (e.type !== "feedback" && e.type !== "view" && e.type !== "try")
          return;
        const demo = seedDemos.find((d) => d.id === e.demoId);
        if (demo?.authorId !== YOU_ID) return;
        if (e.type === "view") {
          bumpDemo(e.demoId, "proViews");
          pushInbox({
            kind: "view",
            fromName: e.fromName,
            text: e.fromTitle,
            demoId: e.demoId,
          });
        } else if (e.type === "try") {
          bumpDemo(e.demoId, "tries");
          pushInbox({
            kind: "try",
            fromName: e.fromName,
            text: e.fromTitle,
            demoId: e.demoId,
          });
        } else if (e.type === "feedback") {
          setComments((prev) =>
            prev.some((c) => c.id === e.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: e.id,
                    demoId: e.demoId,
                    authorId: PRO_YOU_ID,
                    text: e.text,
                    isFeedback: true,
                    fromName: e.fromName,
                    fromTitle: e.fromTitle,
                  },
                ],
          );
          setPoints((p) => p + 5);
          pushInbox({
            kind: "feedback",
            fromName: e.fromName,
            text: e.text,
            demoId: e.demoId,
            reward: "+5",
          });
        }
        return;
      }
      if (e.type !== "helpful" && e.type !== "reply") return;
      const mine = commentsRef.current.find(
        (c) => c.id === e.commentId && c.authorId === PRO_YOU_ID,
      );
      if (!mine) return;
      if (e.type === "helpful") {
        setCredits((c) => c + 5);
        setHelpfulReceived((n) => n + 1);
        pushInbox({
          kind: "helpful",
          fromName: e.fromName,
          text: mine.text,
          demoId: mine.demoId,
          reward: "+5",
        });
      } else {
        pushInbox({
          kind: "reply",
          fromName: e.fromName,
          text: e.text,
          demoId: mine.demoId,
        });
      }
    });
  }, [session, bumpDemo, pushInbox]);

  const dismissInbox = useCallback((id: string) => {
    setInbox((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const markFeedbackSeen = useCallback((ids: string[]) => {
    setSeenFeedback((prev) => {
      const add = ids.filter((id) => !prev.includes(id));
      return add.length ? [...prev, ...add] : prev;
    });
  }, []);

  const markHelpful = useCallback(
    (commentId: string) => {
      setHelpfulIds((prev) =>
        prev.includes(commentId) ? prev : [...prev, commentId],
      );
      setPoints((p) => p + 1);
      postBridge({ type: "helpful", commentId, fromName: you.name });
    },
    [you.name],
  );

  const replyToFeedback = useCallback(
    (commentId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setReplies((prev) => ({ ...prev, [commentId]: trimmed }));
      postBridge({
        type: "reply",
        commentId,
        fromName: you.name,
        text: trimmed,
      });
    },
    [you.name],
  );

  const proTitle = [you.workforceRole, you.company].filter(Boolean).join(" · ");

  const notifyDemo = useCallback(
    (demoId: string, type: "view" | "try") => {
      postBridge({ type, demoId, fromName: you.name, fromTitle: proTitle });
    },
    [you.name, proTitle],
  );

  const askUp = useCallback(
    (ladderProId: string) => {
      if (credits < ASK_UP_COST || asks[ladderProId]) return false;
      setCredits((c) => c - ASK_UP_COST);
      setAsks((prev) => ({ ...prev, [ladderProId]: "pending" }));
      // Prototype: the senior accepts after a moment
      setTimeout(() => {
        setAsks((prev) => ({ ...prev, [ladderProId]: "accepted" }));
        const pro = ladderPros.find((lp) => lp.id === ladderProId);
        pushInbox({
          kind: "accepted",
          fromName: pro?.name ?? "A mentor",
          text: "Accepted your ask. Pick a 15-min slot.",
        });
      }, 2500);
      return true;
    },
    [credits, asks, pushInbox],
  );

  const toggleConnectPro = useCallback((ladderProId: string) => {
    setConnectedPros((prev) =>
      prev.includes(ladderProId)
        ? prev.filter((x) => x !== ladderProId)
        : [...prev, ladderProId],
    );
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const toggleLike = useCallback((demoId: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      const adding = !next.has(demoId);
      if (adding) next.add(demoId);
      else next.delete(demoId);
      setDemos((ds) =>
        ds.map((d) =>
          d.id === demoId ? { ...d, likes: d.likes + (adding ? 1 : -1) } : d,
        ),
      );
      if (adding) setPoints((p) => p + 1);
      return next;
    });
  }, []);

  const addFeedback = useCallback(
    (demoId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const id = `c-${Date.now()}`;
      setComments((prev) => [
        ...prev,
        {
          id,
          demoId,
          authorId: youId,
          text: trimmed,
          isFeedback: true,
        },
      ]);
      setPoints((p) => p + 3);
      setGithubRating((r) => Math.min(100, r + 1));
      if (session === "professional") {
        setFeedbackMinsToday((m) => Math.min(feedbackGoalMins, m + 5));
        setCredits((c) => c + 2);
        setFeedbackSent((n) => n + 1);
        postBridge({
          type: "feedback",
          id,
          demoId,
          fromName: you.name,
          fromTitle: proTitle,
          text: trimmed,
          at: Date.now(),
        });
      }
    },
    [youId, session, feedbackGoalMins, you.name, proTitle],
  );

  const remixDemo = useCallback(
    (demoId: string) => {
      if (remixed.has(demoId)) return;
      setRemixed((prev) => new Set(prev).add(demoId));
      setDemos((ds) =>
        ds.map((d) =>
          d.id === demoId ? { ...d, remixCount: d.remixCount + 1 } : d,
        ),
      );
      setPoints((p) => p + 5);
      setGithubRating((r) => Math.min(100, r + 2));
    },
    [remixed],
  );

  const swipeMatch = useCallback((cardId: string, personId: string) => {
    setMatched((prev) =>
      prev.includes(personId) ? prev : [...prev, personId],
    );
    setPassed((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));
    setPoints((p) => p + 2);
  }, []);

  const swipePass = useCallback((cardId: string) => {
    setPassed((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));
  }, []);

  const redeem = useCallback(
    (shopItemId: string, mentorId: string, cost: number, minutes: number) => {
      if (points < cost) return false;
      setPoints((p) => p - cost);
      setBookings((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          shopItemId,
          mentorId,
          pointsSpent: cost,
          minutes,
          at: Date.now(),
        },
      ]);
      return true;
    },
    [points],
  );

  const joinProject = useCallback(
    (projectId: string, pointsOnComplete: number) => {
      if (joinedProjects.includes(projectId)) return;
      setJoinedProjects((prev) => [...prev, projectId]);
      setPoints((p) => p + Math.round(pointsOnComplete * 0.25));
      setGithubRating((r) => Math.min(100, r + 3));
    },
    [joinedProjects],
  );

  const joinSponsor = useCallback(
    (sponsorId: string) => {
      if (joinedSponsors.includes(sponsorId)) return;
      setJoinedSponsors((prev) => [...prev, sponsorId]);
      setPoints((p) => p + 15);
    },
    [joinedSponsors],
  );

  const logFeedbackMinutes = useCallback((mins: number) => {
    setFeedbackMinsToday((m) => Math.min(180, m + mins));
  }, []);

  const sendMessage = useCallback((toId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `dm-${Date.now()}`, toId, text: trimmed, at: Date.now() },
    ]);
  }, []);

  const applyGithubAiBump = useCallback(() => {
    setGithubRating((r) => Math.min(100, r + 4));
    setPoints((p) => p + 2);
  }, []);

  const applyGithubScore = useCallback((profile: GithubProfile) => {
    setGithubProfile((prev) => {
      if (!prev) setPoints((p) => p + 5);
      return profile;
    });
    setGithubRating(profile.score);
  }, []);

  const clearGithubProfile = useCallback(() => {
    setGithubProfile(null);
  }, []);

  const chooseMajor = useCallback((m: string) => {
    setMyMajor(m);
    setMajorOnly(true);
  }, []);

  const demosWithStats = useMemo(
    () =>
      demos.map((d) => {
        const delta = demoDeltas[d.id];
        return delta
          ? {
              ...d,
              tries: (d.tries ?? 0) + delta.tries,
              proViews: (d.proViews ?? 0) + delta.proViews,
            }
          : d;
      }),
    [demos, demoDeltas],
  );

  const value = useMemo<RungContextValue>(
    () => ({
      hydrated,
      session,
      login,
      logout,
      points,
      githubRating,
      githubProfile,
      tier,
      liked,
      remixed,
      matched,
      passed,
      demos: demosWithStats,
      comments,
      bookings,
      joinedProjects,
      joinedSponsors,
      question,
      collegeFilter,
      setCollegeFilter,
      myMajor,
      setMyMajor: chooseMajor,
      majorOnly,
      setMajorOnly,
      exploreMajors,
      setExploreMajors,
      proMajors,
      proFields: profile?.proFields ?? [],
      proLevel: profile?.level ?? 2,
      setProFields,
      inbox,
      dismissInbox,
      seenFeedback,
      markFeedbackSeen,
      helpfulIds,
      markHelpful,
      replies,
      replyToFeedback,
      notifyDemo,
      credits,
      helpfulReceived,
      feedbackSent,
      asks,
      askUp,
      connectedPros,
      toggleConnectPro,
      feedbackMinsToday,
      feedbackGoalMins,
      logFeedbackMinutes,
      messages,
      sendMessage,
      you,
      toggleLike,
      addFeedback,
      remixDemo,
      swipeMatch,
      swipePass,
      redeem,
      joinProject,
      joinSponsor,
      setQuestion,
      applyGithubAiBump,
      applyGithubScore,
      clearGithubProfile,
    }),
    [
      hydrated,
      session,
      login,
      logout,
      points,
      githubRating,
      githubProfile,
      tier,
      liked,
      remixed,
      matched,
      passed,
      demosWithStats,
      comments,
      bookings,
      joinedProjects,
      joinedSponsors,
      question,
      collegeFilter,
      myMajor,
      chooseMajor,
      majorOnly,
      exploreMajors,
      proMajors,
      profile,
      setProFields,
      inbox,
      dismissInbox,
      seenFeedback,
      markFeedbackSeen,
      helpfulIds,
      markHelpful,
      replies,
      replyToFeedback,
      notifyDemo,
      credits,
      helpfulReceived,
      feedbackSent,
      asks,
      askUp,
      connectedPros,
      toggleConnectPro,
      feedbackMinsToday,
      feedbackGoalMins,
      logFeedbackMinutes,
      messages,
      sendMessage,
      you,
      toggleLike,
      addFeedback,
      remixDemo,
      swipeMatch,
      swipePass,
      redeem,
      joinProject,
      joinSponsor,
      applyGithubAiBump,
      applyGithubScore,
      clearGithubProfile,
    ],
  );

  return <RungContext.Provider value={value}>{children}</RungContext.Provider>;
}

export function useRung() {
  const ctx = useContext(RungContext);
  if (!ctx) throw new Error("useRung must be used within RungProvider");
  return ctx;
}
