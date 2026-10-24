"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PRO_YOU_ID,
  YOU_ID,
  comments as seedComments,
  demos as seedDemos,
  personById,
  tierForPoints,
  type Comment,
  type Demo,
  type Tier,
} from "@/lib/rung-data";

export type SessionKind = "student" | "professional";

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

type RungContextValue = {
  hydrated: boolean;
  session: SessionKind | null;
  login: (kind: SessionKind) => void;
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

const RungContext = createContext<RungContextValue | null>(null);
const STORAGE_KEY = "cc-demo-v2";

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
  const [feedbackMinsToday, setFeedbackMinsToday] = useState(0);
  const [messages, setMessages] = useState<Dm[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const feedbackGoalMins = 30;

  const youId = session === "professional" ? PRO_YOU_ID : YOU_ID;
  const baseYou = personById(youId);
  const you = useMemo(
    () =>
      session === "student"
        ? { ...baseYou, major: myMajor }
        : baseYou,
    [baseYou, myMajor, session],
  );
  const tier = tierForPoints(points);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (parsed.session === "student" || parsed.session === "professional") {
          setSession(parsed.session);
        }
        if (typeof parsed.points === "number") setPoints(parsed.points);
        if (typeof parsed.githubRating === "number")
          setGithubRating(parsed.githubRating);
        if (parsed.githubProfile && typeof parsed.githubProfile === "object") {
          setGithubProfile(parsed.githubProfile as GithubProfile);
        }
        if (Array.isArray(parsed.liked)) setLiked(new Set(parsed.liked as string[]));
        if (Array.isArray(parsed.remixed))
          setRemixed(new Set(parsed.remixed as string[]));
        if (Array.isArray(parsed.matched)) setMatched(parsed.matched as string[]);
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
        if (typeof parsed.majorOnly === "boolean") setMajorOnly(parsed.majorOnly);
        if (typeof parsed.feedbackMinsToday === "number")
          setFeedbackMinsToday(parsed.feedbackMinsToday);
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages as Dm[]);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        session,
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
        feedbackMinsToday,
        messages,
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
    feedbackMinsToday,
    messages,
  ]);

  const login = useCallback((kind: SessionKind) => {
    setSession(kind);
    if (kind === "student") {
      setPoints(28);
      setGithubRating(42);
      setGithubProfile(null);
      setCollegeFilter("Ohio State");
      setMyMajor("Biology");
      setMajorOnly(true);
    } else {
      setPoints(0);
      setGithubRating(94);
      setGithubProfile(null);
      setCollegeFilter("Ohio State");
      setFeedbackMinsToday(12);
    }
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
      setComments((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
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
      }
    },
    [youId, session, feedbackGoalMins],
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
    setMatched((prev) => (prev.includes(personId) ? prev : [...prev, personId]));
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
      demos,
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
      demos,
      comments,
      bookings,
      joinedProjects,
      joinedSponsors,
      question,
      collegeFilter,
      myMajor,
      chooseMajor,
      majorOnly,
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
