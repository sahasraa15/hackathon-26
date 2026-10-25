"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, ChevronRight, SendHorizontal } from "lucide-react";
import {
  PRO_YOU_ID,
  YOU_ID,
  demoAuthor,
  ladderPros,
  networkPros,
  personById,
  shopItems,
} from "@/lib/rung-data";
import { ASK_UP_COST, useRung } from "@/lib/rung-store";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  text: string;
  detail?: string;
  href: string;
  due?: "Today" | "Tomorrow" | "This week";
  topic: "feedback" | "connect" | "progress";
};

type Msg = { from: "bot" | "you"; text: string; tasks?: Task[] };

function partOfDay() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

/** Builds today's to-do list from what's actually in the app. */
function useTasks(): Task[] {
  const r = useRung();
  return useMemo(() => {
    const tasks: Task[] = [];

    if (r.session === "professional") {
      const pending = r.demos.filter(
        (d) =>
          (d.authorId === YOU_ID ||
            r.proMajors.includes(demoAuthor(d).major ?? "")) &&
          !r.comments.some(
            (c) => c.demoId === d.id && c.authorId === PRO_YOU_ID,
          ),
      );
      pending.slice(0, 2).forEach((d, i) =>
        tasks.push({
          id: `fb-${d.id}`,
          text: `Give feedback to ${demoAuthor(d).name} on “${d.title}”`,
          detail: "+2 credits · +5 more if they mark it helpful",
          href: "/pro/feedback",
          due: i === 0 ? "Tomorrow" : "This week",
          topic: "feedback",
        }),
      );

      const left = r.feedbackGoalMins - r.feedbackMinsToday;
      if (left > 0)
        tasks.push({
          id: "goal",
          text: `${left} min left on today's feedback goal`,
          detail: "Hit it to count toward your company bonus",
          href: "/pro/feedback",
          due: "Today",
          topic: "feedback",
        });

      Object.entries(r.asks)
        .filter(([, s]) => s === "accepted")
        .forEach(([id]) => {
          const p = ladderPros.find((lp) => lp.id === id);
          if (p)
            tasks.push({
              id: `book-${id}`,
              text: `Book your 15 min with ${p.name}`,
              detail: `${p.title} · ${p.company}`,
              href: "/pro/ladder",
              due: "This week",
              topic: "connect",
            });
        });

      const up = ladderPros
        .filter(
          (p) =>
            r.proFields.includes(p.field) &&
            p.level > r.proLevel &&
            !r.asks[p.id],
        )
        .sort((a, b) => a.level - b.level)[0];
      if (up)
        tasks.push({
          id: `up-${up.id}`,
          text: `Connect with ${up.name} to up your skills`,
          detail: `${up.title} at ${up.company} · Ask up costs ${ASK_UP_COST}, you have ${r.credits} credits`,
          href: "/pro/ladder",
          topic: "connect",
        });

      const recruiter = networkPros.find(
        (p) =>
          p.kind === "recruiter" &&
          r.proFields.includes(p.field) &&
          !r.connectedPros.includes(p.id),
      );
      if (recruiter)
        tasks.push({
          id: `rec-${recruiter.id}`,
          text: `Say hi to ${recruiter.name}, recruiting at ${recruiter.company}`,
          detail: `Hiring: ${recruiter.hiringFor}. Refer your strongest student.`,
          href: "/network",
          topic: "connect",
        });

      if (r.helpfulReceived < 3)
        tasks.push({
          id: "badge",
          text: `${3 - r.helpfulReceived} more helpful notes to unlock “Helpful ×3”`,
          href: "/pro/ladder",
          topic: "progress",
        });
      return tasks;
    }

    const mineIds = new Set(r.myDemos.map((d) => d.id));
    const notes = r.comments.filter(
      (c) => mineIds.has(c.demoId) && c.isFeedback,
    );
    const unread = notes.filter((c) => !r.seenFeedback.includes(c.id));
    if (unread.length)
      tasks.push({
        id: "unread",
        text: `Read ${unread.length} new note${unread.length > 1 ? "s" : ""} from professionals`,
        detail: "Mark the helpful ones: the pro earns credits",
        href: "/my-projects",
        due: "Today",
        topic: "feedback",
      });
    const thank = notes.find(
      (c) => !unread.includes(c) && !r.helpfulIds.includes(c.id),
    );
    if (thank)
      tasks.push({
        id: `thank-${thank.id}`,
        text: `Thank ${thank.fromName ?? personById(thank.authorId).name} for their note`,
        detail: "Tap “This helped” or reply with a follow-up",
        href: "/my-projects",
        topic: "feedback",
      });
    if (r.myDemos.length === 0)
      tasks.push({
        id: "post",
        text: "Post your first project to get pro feedback",
        detail: "+5 pts · pros in your field see it right away",
        href: "/my-projects",
        due: "Today",
        topic: "progress",
      });
    tasks.push({
      id: "match",
      text: `Swipe on new ${r.myMajor} peers`,
      detail: "+2 pts per match",
      href: "/match",
      topic: "connect",
    });
    const cheapest = [...shopItems].sort((a, b) => a.points - b.points)[0];
    if (cheapest)
      tasks.push({
        id: "mentor",
        text:
          r.points >= cheapest.points
            ? `You can book ${cheapest.minutes} min with a pro now`
            : `${cheapest.points - r.points} pts to book ${cheapest.minutes} min with a pro`,
        href: "/mentors",
        topic: "connect",
      });
    if (!r.githubProfile)
      tasks.push({
        id: "gh",
        text: "Connect GitHub to boost your portfolio score",
        href: "/profile",
        topic: "progress",
      });
    return tasks;
  }, [r]);
}

function TaskList({ tasks }: { tasks: Task[] }) {
  if (!tasks.length)
    return <p className="text-sm">Nothing left. You&apos;re all caught up.</p>;
  return (
    <ul className="mt-1 space-y-1.5">
      {tasks.map((t) => (
        <li key={t.id}>
          <Link
            href={t.href}
            className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-black/[0.05] active:bg-[#f6efff]"
          >
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rung-ember" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium leading-snug text-rung-fg">
                {t.text}
              </span>
              {t.detail && (
                <span className="block text-[11px] text-rung-mute">
                  {t.detail}
                </span>
              )}
            </span>
            {t.due && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  t.due === "Today"
                    ? "bg-[#ffe2c5]"
                    : "bg-[#fffcf0] text-rung-mute",
                )}
              >
                {t.due}
              </span>
            )}
            <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-rung-mute" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function answer(
  q: string,
  tasks: Task[],
  ctx: { pro: boolean; credits: number; points: number },
): Msg {
  const s = q.toLowerCase();
  const pick = (topic: Task["topic"]) => tasks.filter((t) => t.topic === topic);
  if (/credit|point|earn|reward|incentive/.test(s))
    return {
      from: "bot",
      text: ctx.pro
        ? `You have ${ctx.credits} credits. +2 for each note you send, +5 when a student marks it helpful. Spend ${ASK_UP_COST} to ask someone a rung up.`
        : `You have ${ctx.points} pts. Earn them by posting projects (+5), getting pro notes (+5), likes and matches. Spend them on mentor time.`,
    };
  if (/meet|connect|network|who|skill|grow|recruit|mentor/.test(s)) {
    const c = pick("connect");
    return {
      from: "bot",
      text: c.length
        ? "People worth your time this week:"
        : "No new suggestions right now.",
      tasks: c,
    };
  }
  if (/feedback|note|review|comment/.test(s)) {
    const f = pick("feedback");
    return {
      from: "bot",
      text: f.length ? "Feedback on your plate:" : "No feedback waiting. Nice.",
      tasks: f,
    };
  }
  if (/thank|done|bye|great|cool/.test(s))
    return {
      from: "bot",
      text: tasks.length
        ? `Anytime. ${tasks.length} thing${tasks.length > 1 ? "s" : ""} left whenever you're ready.`
        : "Anytime. You're all caught up.",
    };
  if (/due|todo|to do|left|remaining|today|tomorrow|next|what|plan/.test(s))
    return {
      from: "bot",
      text: `Here's what's left (${tasks.length}):`,
      tasks,
    };
  return {
    from: "bot",
    text: "I can tell you what's due, who to meet, or how to earn more. Top thing right now:",
    tasks: tasks.slice(0, 1),
  };
}

const chips = ["What's due?", "Who should I meet?", "How do I earn more?"];

/** Assistant card: a morning brief built from your real to-dos, plus quick Q&A. */
export function DailyBrief({ collapsible = false }: { collapsible?: boolean }) {
  const { you, session, credits, points } = useRung();
  const tasks = useTasks();
  const pro = session === "professional";
  const first = you.name.split(" ")[0];
  const [open, setOpen] = useState(!collapsible);
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // "New today" until the brief has been seen once on this date
  const briefKey = `cc-brief-${session}`;
  const [isNewToday] = useState(() => {
    try {
      return localStorage.getItem(briefKey) !== new Date().toDateString();
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(briefKey, new Date().toDateString());
    } catch {
      /* ignore */
    }
  }, [briefKey]);

  const dueSoon = tasks.filter(
    (t) => t.due === "Today" || t.due === "Tomorrow",
  ).length;

  function ask(q: string) {
    const text = q.trim();
    if (!text) return;
    setThread((prev) => [
      ...prev,
      { from: "you", text },
      answer(text, tasks, { pro, credits, points }),
    ]);
    setDraft("");
    setTimeout(
      () =>
        endRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        }),
      50,
    );
  }

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[#f6efff] to-[#fff4e8] p-4">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e5ccff]">
          <Bot className="size-4 text-rung-fg" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-rung-fg">
            Your {partOfDay()} brief
            {isNewToday && (
              <span className="rounded-full bg-rung-ember px-1.5 py-0.5 text-[9px] font-semibold text-white">
                NEW
              </span>
            )}
          </span>
          <span className="block text-[11px] text-rung-mute">
            {tasks.length} to-dos{dueSoon ? ` · ${dueSoon} due soon` : ""} ·{" "}
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </span>
        {collapsible && (
          <ChevronDown
            className={cn(
              "size-4 text-rung-mute transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl rounded-tl-sm bg-white/70 p-3 text-sm text-rung-fg">
                Good {partOfDay()}, {first}.{" "}
                {tasks.length
                  ? "Here's what's left for you:"
                  : "You're all caught up."}
                <TaskList tasks={tasks.slice(0, pro ? 5 : 4)} />
              </div>

              {thread.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "max-w-[90%] rounded-2xl p-3 text-sm",
                    m.from === "you"
                      ? "ml-auto rounded-tr-sm bg-[#e5ccff] text-rung-fg"
                      : "rounded-tl-sm bg-white/70 text-rung-fg",
                  )}
                >
                  {m.text}
                  {m.tasks && m.tasks.length > 0 && (
                    <TaskList tasks={m.tasks} />
                  )}
                </motion.div>
              ))}
              <div ref={endRef} />

              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => ask(c)}
                    className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-rung-fg ring-1 ring-black/[0.06]"
                  >
                    {c}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(draft);
                }}
                className="flex gap-2"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask what's next…"
                  aria-label="Ask the assistant"
                  className="min-w-0 flex-1 rounded-full bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-[#c9a6ff]"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e5ccff]"
                >
                  <SendHorizontal className="size-4 text-rung-fg" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
