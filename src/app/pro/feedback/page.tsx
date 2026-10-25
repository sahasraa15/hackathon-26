"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { YOU_ID, people, personById } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";

/** Demo ids this tab already reported as viewed, so revisits don't re-count */
const viewedThisTab = new Set<string>();

export default function ProFeedbackPage() {
  const {
    demos,
    addFeedback,
    logFeedbackMinutes,
    feedbackMinsToday,
    feedbackGoalMins,
    you,
    matched,
    swipeMatch,
    proMajors,
    notifyDemo,
  } = useRung();
  const [tried, setTried] = useState<Set<string>>(() => new Set());
  // Students in the pro's fields first; fall back to everyone if none match
  const fieldDemos = demos.filter((d) =>
    proMajors.includes(personById(d.authorId).major ?? ""),
  );
  // The student's own demo is pinned first so the live two-window demo works
  const queue = [
    ...demos.filter((d) => d.authorId === YOU_ID),
    ...(fieldDemos.length ? fieldDemos : demos).filter(
      (d) => d.authorId !== YOU_ID,
    ),
  ];
  useEffect(() => {
    for (const d of demos) {
      if (d.authorId !== YOU_ID || viewedThisTab.has(d.id)) continue;
      viewedThisTab.add(d.id);
      notifyDemo(d.id, "view");
    }
  }, [demos, notifyDemo]);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const seniors = people
    .filter(
      (p) =>
        p.role === "industry" &&
        p.id !== you.id &&
        (p.githubRating ?? 0) >= you.githubRating,
    )
    .slice(0, 3);
  const mentees = people
    .filter((p) => p.role === "student" && p.githubRating < 50)
    .slice(0, 4);

  return (
    <div className="px-5 pt-4 pb-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
            Feedback
          </h1>
          <p className="mt-1 text-sm text-rung-mute">
            {feedbackMinsToday}/{feedbackGoalMins}m today
          </p>
        </div>
        <button
          type="button"
          onClick={() => logFeedbackMinutes(5)}
          className="rounded-full bg-[#e5ccff] px-3 py-1.5 text-xs font-semibold text-rung-fg"
        >
          +5 min
        </button>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-rung-fg">Queue</h2>
        <ul className="mt-3 space-y-3">
          {queue.slice(0, 3).map((d) => (
            <li
              key={d.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-rung-fg">{d.title}</p>
                {d.authorId === YOU_ID && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#ffe2c5] px-2 py-0.5 text-[10px] font-semibold text-rung-fg">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#e2552b]" />
                    Live
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className="text-xs text-rung-mute">
                  {personById(d.authorId).name} · {personById(d.authorId).major}
                </p>
                {d.authorId === YOU_ID && (
                  <button
                    type="button"
                    disabled={tried.has(d.id)}
                    onClick={() => {
                      setTried((prev) => new Set(prev).add(d.id));
                      notifyDemo(d.id, "try");
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-full border border-black/[0.08] px-2.5 py-1 text-[11px] font-medium text-rung-fg disabled:opacity-50"
                  >
                    <Play className="size-3" />
                    {tried.has(d.id) ? "Tried" : "Try prototype"}
                  </button>
                )}
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addFeedback(d.id, drafts[d.id] ?? "");
                  setDrafts((prev) => ({ ...prev, [d.id]: "" }));
                }}
              >
                <input
                  value={drafts[d.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [d.id]: e.target.value }))
                  }
                  placeholder="Note…"
                  className="flex-1 rounded-full bg-[#fffcf0] px-3 py-2 text-sm outline-none ring-1 ring-black/[0.06]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#e5ccff] px-3 py-2 text-xs font-semibold"
                >
                  Send
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-rung-fg">Connect up</h2>
        <ul className="mt-3 space-y-2">
          {seniors.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-3 py-3"
            >
              <Avatar initials={p.avatar} role={p.role} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-rung-fg">
                  {p.name}
                </p>
                <p className="truncate text-xs text-rung-mute">{p.company}</p>
              </div>
              <button
                type="button"
                disabled={matched.includes(p.id)}
                onClick={() => swipeMatch(`pro-${p.id}`, p.id)}
                className="rounded-full bg-[#e5ccff] px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50"
              >
                {matched.includes(p.id) ? "Done" : "Connect"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-rung-fg">Mentee</h2>
        <ul className="mt-3 space-y-2">
          {mentees.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-3 py-3"
            >
              <Avatar initials={p.avatar} role={p.role} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-rung-fg">
                  {p.name}
                </p>
                <p className="truncate text-xs text-rung-mute">{p.major}</p>
              </div>
              <button
                type="button"
                disabled={matched.includes(p.id)}
                onClick={() => swipeMatch(`mentee-${p.id}`, p.id)}
                className="rounded-full bg-[#ffe2c5] px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50"
              >
                {matched.includes(p.id) ? "Done" : "Offer"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
