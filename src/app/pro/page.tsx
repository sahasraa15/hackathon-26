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
      <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
        Hi, {you.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-rung-mute">
        {[you.workforceRole, you.company].filter(Boolean).join(" · ")}
      </p>

      <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-rung-mute">Today</p>
            <p className="mt-0.5 text-3xl font-semibold tabular-nums text-rung-fg">
              {feedbackMinsToday}
              <span className="text-base font-normal text-rung-mute">
                /{feedbackGoalMins}m
              </span>
            </p>
          </div>
          <p className="text-xs font-medium text-rung-ember">→ bonus</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[#e5ccff]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Link
          href="/pro/feedback"
          className="flex flex-col items-center gap-2 rounded-2xl border border-black/[0.06] bg-white px-2 py-4"
        >
          <MessageSquare className="size-5 text-rung-ember" />
          <span className="text-xs font-semibold text-rung-fg">Feedback</span>
        </Link>
        <Link
          href="/pro/sponsors"
          className="flex flex-col items-center gap-2 rounded-2xl border border-black/[0.06] bg-white px-2 py-4"
        >
          <Building2 className="size-5 text-rung-ember" />
          <span className="text-xs font-semibold text-rung-fg">Sponsors</span>
        </Link>
        <Link
          href="/network"
          className="flex flex-col items-center gap-2 rounded-2xl border border-black/[0.06] bg-white px-2 py-4"
        >
          <Users className="size-5 text-rung-ember" />
          <span className="text-xs font-semibold text-rung-fg">People</span>
        </Link>
      </div>
    </div>
  );
}
