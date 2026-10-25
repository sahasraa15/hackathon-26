"use client";

import Link from "next/link";
import { Building2, MessageSquare, Users } from "lucide-react";
import { useRung } from "@/lib/rung-store";

export default function ProHomePage() {
  const { you, feedbackMinsToday, feedbackGoalMins } = useRung();
  const pct = Math.min(
    100,
    Math.round((feedbackMinsToday / feedbackGoalMins) * 100),
  );

  return (
    <div className="px-5 pt-4 pb-10">
      <div className="cc-panel relative overflow-hidden p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-[#fff59a]/50 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-[#e4c4ff]/45 blur-2xl"
        />
        <div className="relative">
          <p className="cc-eyebrow">Mentor desk</p>
          <h1 className="cc-title mt-1 text-2xl">
            Hi, {you.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm font-semibold text-rung-mute">
            {you.company} · {you.college} alum
          </p>
        </div>
      </div>

      <div className="cc-panel mt-4 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="cc-eyebrow">Today</p>
            <p className="cc-title mt-0.5 text-3xl tabular-nums">
              {feedbackMinsToday}
              <span className="text-base font-bold text-rung-mute">
                /{feedbackGoalMins}m
              </span>
            </p>
          </div>
          <p className="text-xs font-extrabold text-rung-ember">→ bonus</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2c1f3a]/08">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#fff59a] to-[#e4c4ff]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Link
          href="/pro/feedback"
          className="cc-panel flex flex-col items-center gap-2 px-2 py-4"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff59a] to-[#e4c4ff]">
            <MessageSquare className="size-5 text-rung-fg" />
          </span>
          <span className="text-xs font-extrabold text-rung-fg">Feedback</span>
        </Link>
        <Link
          href="/pro/sponsors"
          className="cc-panel flex flex-col items-center gap-2 px-2 py-4"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e4c4ff] to-[#fff59a]">
            <Building2 className="size-5 text-rung-fg" />
          </span>
          <span className="text-xs font-extrabold text-rung-fg">Sponsors</span>
        </Link>
        <Link
          href="/network"
          className="cc-panel flex flex-col items-center gap-2 px-2 py-4"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff59a] to-[#f0e0ff]">
            <Users className="size-5 text-rung-fg" />
          </span>
          <span className="text-xs font-extrabold text-rung-fg">People</span>
        </Link>
      </div>
    </div>
  );
}
