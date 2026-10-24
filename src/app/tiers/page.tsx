"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { profVideos, sponsorProjects, tiers } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { cn } from "@/lib/utils";

export default function TiersPage() {
  const { points, tier, session } = useRung();
  const goldUnlocked = points >= 90;
  const platinumUnlocked = points >= 160;

  return (
    <div className="px-5 pt-4 pb-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-rung-mute">
        Retention ladder
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-rung-fg">
        Tiers & benefits
      </h1>
      <p className="mt-1.5 text-sm text-rung-mute">
        Why people come back — each tier unlocks real access.
      </p>

      <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white p-4">
        <p className="text-xs text-rung-mute">You are</p>
        <p className="text-2xl font-semibold text-rung-fg">{tier.name}</p>
        <p className="text-sm text-rung-mute">{points} points</p>
      </div>

      <ul className="mt-5 space-y-3">
        {tiers.map((t) => {
          const active = t.id === tier.id;
          const unlocked = points >= t.minPoints;
          return (
            <li
              key={t.id}
              className={cn(
                "rounded-2xl border p-4",
                active
                  ? "border-[#e5ccff] bg-[#f6efff]/70"
                  : "border-black/[0.06] bg-white",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-rung-fg">{t.name}</p>
                <p className="text-xs text-rung-mute">{t.minPoints}+ pts</p>
              </div>
              <ul className="mt-3 space-y-1.5">
                {t.benefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-rung-mute"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 size-3.5 shrink-0",
                        unlocked ? "text-rung-ember" : "text-rung-mute/40",
                      )}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-rung-fg">
          Gold · professor mentor videos
        </h2>
        {!goldUnlocked && (
          <p className="mt-1 text-xs text-rung-mute">
            Unlock at 90 pts ({90 - points} to go).
          </p>
        )}
        <ul className="mt-3 space-y-2">
          {profVideos.map((v) => (
            <li
              key={v.id}
              className={cn(
                "rounded-xl border border-black/[0.06] px-4 py-3",
                goldUnlocked ? "bg-white" : "bg-black/[0.02] opacity-60",
              )}
            >
              <p className="text-sm font-medium text-rung-fg">{v.title}</p>
              <p className="text-xs text-rung-mute">
                {v.prof} · {v.mins} min
                {!goldUnlocked && " · locked"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-rung-fg">
          Platinum · sponsor projects
        </h2>
        {!platinumUnlocked && (
          <p className="mt-1 text-xs text-rung-mute">
            Unlock at 160 pts — Google, Honda, Meta briefs for credit.
          </p>
        )}
        <ul className="mt-3 space-y-2">
          {sponsorProjects.map((s) => (
            <li
              key={s.id}
              className={cn(
                "rounded-xl border border-black/[0.06] px-4 py-3",
                platinumUnlocked ? "bg-white" : "bg-black/[0.02] opacity-60",
              )}
            >
              <p className="text-xs font-medium text-rung-ember">{s.company}</p>
              <p className="text-sm font-medium text-rung-fg">{s.title}</p>
              <p className="mt-1 text-xs text-rung-mute">{s.credit}</p>
            </li>
          ))}
        </ul>
        {session === "student" && platinumUnlocked && (
          <Link
            href="/projects"
            className="mt-3 inline-block text-sm font-medium text-rung-ember"
          >
            Browse unlockable briefs →
          </Link>
        )}
        {session === "professional" && (
          <Link
            href="/pro/sponsors"
            className="mt-3 inline-block text-sm font-medium text-rung-ember"
          >
            Manage company sponsors →
          </Link>
        )}
      </section>
    </div>
  );
}
