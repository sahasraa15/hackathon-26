"use client";

import { Check } from "lucide-react";
import {
  personById,
  projectsForRating,
  ratingTone,
  sponsorProjects,
} from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const {
    githubRating,
    joinProject,
    joinedProjects,
    points,
    joinSponsor,
    joinedSponsors,
    tier,
  } = useRung();
  const suggested = projectsForRating(githubRating);
  const tone = ratingTone(githubRating);
  const platinum = points >= 160;

  return (
    <div className="px-5 pt-4 pb-10">
      <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
        For you
      </h1>

      <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-rung-mute">Portfolio score</p>
            <p className="mt-0.5 text-3xl font-semibold tabular-nums text-rung-fg">
              {githubRating}
            </p>
            <p className="mt-0.5 text-sm text-rung-ember">{tone.label}</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[#e5ccff]"
            style={{ width: `${githubRating}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-rung-mute">{tone.tip}</p>
      </div>

      <div className="mt-4 rounded-xl bg-[#f6efff] px-3 py-2 text-xs text-rung-mute">
        Tier: <span className="font-semibold text-rung-fg">{tier.name}</span>
        {!platinum && " · hit Platinum (160 pts) for Google/Honda sponsor briefs"}
      </div>

      {platinum && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-rung-fg">
            Sponsor projects
          </h2>
          <ul className="mt-3 space-y-3">
            {sponsorProjects.map((s) => {
              const joined = joinedSponsors.includes(s.id);
              return (
                <li
                  key={s.id}
                  className="rounded-2xl border border-[#e5ccff] bg-white p-4"
                >
                  <p className="text-xs font-semibold text-rung-ember">
                    {s.company}
                  </p>
                  <h3 className="mt-1 font-semibold text-rung-fg">{s.title}</h3>
                  <p className="mt-1 text-sm text-rung-mute">{s.problem}</p>
                  <p className="mt-2 text-xs text-rung-mute">{s.credit}</p>
                  <button
                    type="button"
                    disabled={joined}
                    onClick={() => joinSponsor(s.id)}
                    className="mt-3 w-full rounded-full bg-[#e5ccff] py-2.5 text-sm font-semibold text-rung-fg disabled:opacity-60"
                  >
                    {joined ? "Joined for credit" : "Take brief (unpaid · credit)"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ul className="mt-6 space-y-3">
        {suggested.map((p) => {
          const joined = joinedProjects.includes(p.id);
          return (
            <li
              key={p.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-rung-mute">
                    Diff {p.difficulty}/5 · {p.duration}
                    {p.company ? ` · ${p.company}` : ""}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-rung-fg">
                    {p.title}
                  </h2>
                </div>
                <span className="shrink-0 rounded-full bg-[#f6efff] px-2.5 py-1 text-[11px] font-medium text-rung-ember">
                  +{p.pointsOnComplete}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-rung-mute">
                {p.blurb}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#fffcf0] px-2 py-0.5 text-[11px] text-rung-mute"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-rung-mute">
                Guides:{" "}
                {p.mentorIds.map((id) => personById(id).name).join(" · ")}
              </p>
              <button
                type="button"
                disabled={joined}
                onClick={() => joinProject(p.id, p.pointsOnComplete)}
                className={cn(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold",
                  joined
                    ? "bg-[#f6efff] text-rung-ember"
                    : "bg-[#e5ccff] text-rung-fg",
                )}
              >
                {joined ? (
                  <>
                    <Check className="size-4" /> Joined
                  </>
                ) : (
                  "Join project"
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
