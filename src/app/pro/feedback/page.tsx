"use client";

import { useState } from "react";
import { people } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";

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
  } = useRung();
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
          {demos.slice(0, 3).map((d) => (
            <li
              key={d.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-4"
            >
              <p className="font-medium text-rung-fg">{d.title}</p>
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
