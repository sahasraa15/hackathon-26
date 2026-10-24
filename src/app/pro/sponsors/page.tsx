"use client";

import { sponsorProjects } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";

export default function ProSponsorsPage() {
  const { you, joinSponsor, joinedSponsors } = useRung();

  return (
    <div className="px-5 pt-4 pb-10">
      <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
        Sponsors
      </h1>
      <p className="mt-1 text-sm text-rung-mute">{you.company} briefs</p>

      <ul className="mt-5 space-y-3">
        {sponsorProjects.map((s) => {
          const live = joinedSponsors.includes(s.id);
          return (
            <li
              key={s.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-4"
            >
              <p className="text-xs font-semibold text-rung-ember">{s.company}</p>
              <h2 className="mt-1 font-semibold text-rung-fg">{s.title}</h2>
              <p className="mt-1.5 text-sm text-rung-mute line-clamp-2">
                {s.problem}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#fffcf0] px-2 py-0.5 text-[11px] text-rung-mute"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                disabled={live}
                onClick={() => joinSponsor(s.id)}
                className="mt-4 w-full rounded-full bg-[#e5ccff] py-2.5 text-sm font-semibold text-rung-fg disabled:opacity-60"
              >
                {live ? "Live" : "Publish"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
