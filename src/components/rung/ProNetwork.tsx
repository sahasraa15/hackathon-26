"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Search, Sparkles, UserPlus } from "lucide-react";
import {
  levelLabel,
  networkPros,
  professionFields,
  type LadderPro,
} from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { cn } from "@/lib/utils";

const kinds = [
  { id: "all", label: "All" },
  { id: "recruiter", label: "Recruiters" },
  { id: "enthusiast", label: "Passionate" },
  { id: "mentor", label: "Mentors" },
] as const;

const kindBadge: Record<
  NonNullable<LadderPro["kind"]>,
  { label: string; className: string }
> = {
  recruiter: { label: "Recruiter", className: "bg-[#ffe2c5]" },
  enthusiast: { label: "Passionate", className: "bg-[#ffffc5]" },
  mentor: { label: "Mentor", className: "bg-[#e5ccff]" },
};

function hello(p: LadderPro, myName: string) {
  const first = p.name.split(" ")[0];
  if (p.kind === "recruiter")
    return `Hi ${first}, I'm ${myName}. I mentor students here. Happy to point strong ${p.hiringFor?.split(" ·")[0]} candidates your way.`;
  if (p.kind === "enthusiast")
    return `Hi ${first}, loved that you're into ${p.passion?.split(";")[0].toLowerCase()}. Want to swap notes?`;
  return `Hi ${first}, I'm ${myName}. Would love to learn how you grew into ${p.title.toLowerCase()}.`;
}

export function ProNetwork() {
  const {
    you,
    proFields,
    connectedPros,
    toggleConnectPro,
    messages,
    sendMessage,
  } = useRung();
  const [kind, setKind] = useState<(typeof kinds)[number]["id"]>("all");
  const [myFieldsOnly, setMyFieldsOnly] = useState(false);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return networkPros.filter((p) => {
      if (kind !== "all" && p.kind !== kind) return false;
      if (myFieldsOnly && !proFields.includes(p.field)) return false;
      if (!q) return true;
      return [p.name, p.company, p.title, p.passion, p.hiringFor]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [kind, myFieldsOnly, proFields, query]);

  const companies = new Set(networkPros.map((p) => p.company)).size;

  return (
    <div className="px-5 pt-4 pb-10">
      <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
        Network
      </h1>
      <p className="mt-1 text-sm text-rung-mute">
        Recruiters, mentors and people who love their field, across {companies}{" "}
        companies.
      </p>

      <label className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/[0.06]">
        <Search className="size-4 text-rung-mute" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Company, role or interest"
          aria-label="Search the network"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>

      <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
        {kinds.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
              kind === k.id
                ? "bg-[#e5ccff] text-rung-fg"
                : "bg-white text-rung-mute ring-1 ring-black/[0.06]",
            )}
          >
            {k.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMyFieldsOnly((v) => !v)}
          aria-pressed={myFieldsOnly}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
            myFieldsOnly
              ? "bg-[#ffe2c5] text-rung-fg"
              : "bg-white text-rung-mute ring-1 ring-black/[0.06]",
          )}
        >
          My fields
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {list.length === 0 && (
          <li className="rounded-2xl border border-dashed border-black/[0.12] p-5 text-center text-sm text-rung-mute">
            No one matches yet. Try another filter.
          </li>
        )}
        {list.map((p) => {
          const on = connectedPros.includes(p.id);
          const said = messages.some((m) => m.toId === p.id);
          const badge = kindBadge[p.kind ?? "mentor"];
          const field = professionFields.find((f) => f.id === p.field)?.label;
          return (
            <li
              key={p.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar initials={p.avatar} role="industry" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-rung-fg">
                      {p.name}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-rung-fg",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="truncate text-xs text-rung-mute">
                    {p.title} · {p.company}
                  </p>
                  <p className="text-[11px] text-rung-mute">
                    {field} · {levelLabel(p.level)}
                  </p>
                </div>
              </div>

              {p.hiringFor && (
                <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#fff4e8] px-3 py-2 text-xs text-rung-fg">
                  <Briefcase className="size-3.5 shrink-0 text-rung-ember" />
                  Hiring: {p.hiringFor}
                </p>
              )}
              {p.passion && (
                <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#fffcf0] px-3 py-2 text-xs text-rung-fg">
                  <Sparkles className="size-3.5 shrink-0 text-rung-ember" />
                  {p.passion}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleConnectPro(p.id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold",
                    on
                      ? "bg-[#e5ccff] text-rung-fg"
                      : "border border-black/[0.08] text-rung-fg",
                  )}
                >
                  {on ? (
                    <Check className="size-3.5" />
                  ) : (
                    <UserPlus className="size-3.5" />
                  )}
                  {on ? "Connected" : "Connect"}
                </button>
                <button
                  type="button"
                  disabled={said}
                  onClick={() => sendMessage(p.id, hello(p, you.name))}
                  className="flex-1 rounded-full bg-[#fffcf0] py-2 text-xs font-semibold text-rung-fg ring-1 ring-black/[0.06] disabled:text-rung-mute"
                >
                  {said ? "Message sent" : "Say hi"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
