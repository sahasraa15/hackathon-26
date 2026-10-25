"use client";

import Link from "next/link";
import { Award, Check, ChevronsUp, Coins, Lock, Trophy } from "lucide-react";
import {
  companyMinutes,
  demos,
  ladderPros,
  levelLabel,
  personById,
  professionFields,
  type LadderPro,
} from "@/lib/rung-data";
import { ASK_UP_COST, useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { cn } from "@/lib/utils";

function ProRow({ p, action }: { p: LadderPro; action: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-3">
      <Avatar initials={p.avatar} role="industry" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-rung-fg">{p.name}</p>
        <p className="truncate text-[11px] text-rung-mute">
          {p.title} · {p.company}
        </p>
        <p className="text-[10px] text-rung-mute">
          {levelLabel(p.level)} · {p.helpfulNotes} helpful notes
        </p>
      </div>
      {action}
    </li>
  );
}

function Rung({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative mt-6 border-l-2 border-[#e5ccff] pl-4">
      <span className="absolute -left-[7px] top-1 size-3 rounded-full bg-[#e5ccff] ring-4 ring-rung-bg" />
      <p className="text-sm font-semibold text-rung-fg">{label}</p>
      <p className="mt-0.5 text-xs text-rung-mute">{hint}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function LadderPage() {
  const {
    you,
    credits,
    helpfulReceived,
    feedbackSent,
    asks,
    askUp,
    connectedPros,
    toggleConnectPro,
    proFields,
    proMajors,
    proLevel,
    feedbackMinsToday,
  } = useRung();

  const inFields = ladderPros.filter((p) => proFields.includes(p.field));
  const up = inFields
    .filter((p) => p.level > proLevel)
    .sort((a, b) => a.level - b.level);
  const peers = inFields.filter((p) => p.level === proLevel);
  const below = inFields.filter((p) => p.level < proLevel);
  const studentDemos = demos.filter((d) =>
    proMajors.includes(personById(d.authorId).major ?? ""),
  );
  const fieldName =
    professionFields.find((f) => f.id === proFields[0])?.label ?? "your field";

  const badges = [
    { label: "First note", earned: feedbackSent >= 1, need: "Send 1 note" },
    {
      label: "Helpful ×3",
      earned: helpfulReceived >= 3,
      need: `${helpfulReceived}/3 helpful`,
    },
    {
      label: `Top mentor · ${fieldName}`,
      earned: helpfulReceived >= 5,
      need: `${helpfulReceived}/5 helpful`,
    },
    {
      label: "Asked up",
      earned: Object.keys(asks).length > 0,
      need: "Ask someone up",
    },
  ];

  const myCompany = you.company ?? "Your team";
  // Sample weekly totals; yours grows live with today's feedback minutes
  const board = [
    ...companyMinutes.filter((c) => c.company !== myCompany),
    { company: myCompany, minutes: 180 + feedbackMinsToday },
  ].sort((a, b) => b.minutes - a.minutes);

  return (
    <div className="px-5 pt-4 pb-10">
      <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
        Ladder
      </h1>
      <p className="mt-1 text-sm text-rung-mute">
        Help the rung below. Learn from the rung above.
      </p>

      <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-rung-mute">
              <Coins className="size-3.5 text-rung-ember" />
              Mentor credits
            </p>
            <p className="mt-0.5 text-3xl font-semibold tabular-nums text-rung-fg">
              {credits}
            </p>
          </div>
          <p className="text-right text-[11px] leading-snug text-rung-mute">
            +2 per note you send
            <br />
            +5 when a student marks it helpful
            <br />
            {ASK_UP_COST} to ask someone up
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b.label}
              title={b.earned ? undefined : b.need}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                b.earned
                  ? "bg-[#ffe2c5] text-rung-fg"
                  : "bg-[#fffcf0] text-rung-mute ring-1 ring-black/[0.06]",
              )}
            >
              {b.earned ? (
                <Award className="size-3" />
              ) : (
                <Lock className="size-3" />
              )}
              {b.label}
              {!b.earned && <span className="opacity-70">· {b.need}</span>}
            </span>
          ))}
        </div>
      </div>

      <Rung
        label="One rung up"
        hint="More senior people in your field. Ask for 15 minutes."
      >
        {up.length === 0 ? (
          <p className="text-xs text-rung-mute">
            You&apos;re at the top rung in your fields. Others will ask you.
          </p>
        ) : (
          <ul className="space-y-2">
            {up.map((p) => {
              const status = asks[p.id];
              const short = credits < ASK_UP_COST;
              return (
                <ProRow
                  key={p.id}
                  p={p}
                  action={
                    <button
                      type="button"
                      disabled={Boolean(status) || short}
                      onClick={() => askUp(p.id)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                        status === "accepted"
                          ? "bg-[#e5ccff] text-rung-fg"
                          : status
                            ? "bg-[#fffcf0] text-rung-mute"
                            : "bg-[#e5ccff] text-rung-fg disabled:opacity-40",
                      )}
                    >
                      {status === "accepted" ? (
                        <span className="flex items-center gap-1">
                          <Check className="size-3" /> Accepted
                        </span>
                      ) : status ? (
                        "Pending…"
                      ) : (
                        <span className="flex items-center gap-1">
                          <ChevronsUp className="size-3" /> Ask · {ASK_UP_COST}
                        </span>
                      )}
                    </button>
                  }
                />
              );
            })}
          </ul>
        )}
      </Rung>

      <Rung
        label={`Your rung · ${levelLabel(proLevel)}`}
        hint="Peers to swap notes with."
      >
        {peers.length === 0 ? (
          <p className="text-xs text-rung-mute">No peers at your level yet.</p>
        ) : (
          <ul className="space-y-2">
            {peers.map((p) => {
              const on = connectedPros.includes(p.id);
              return (
                <ProRow
                  key={p.id}
                  p={p}
                  action={
                    <button
                      type="button"
                      onClick={() => toggleConnectPro(p.id)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                        on
                          ? "bg-[#e5ccff] text-rung-fg"
                          : "border border-black/[0.08] text-rung-fg",
                      )}
                    >
                      {on ? "Connected" : "Connect"}
                    </button>
                  }
                />
              );
            })}
          </ul>
        )}
      </Rung>

      <Rung label="The rung below" hint="Help them and earn credits.">
        <Link
          href="/pro/feedback"
          className="flex items-center justify-between rounded-2xl bg-[#f6efff] p-4"
        >
          <span>
            <span className="block text-sm font-semibold text-rung-fg">
              {studentDemos.length} student projects in your field
            </span>
            <span className="text-xs text-rung-mute">
              Give a note · +2 credits each
            </span>
          </span>
          <span className="text-sm font-medium text-rung-ember">Review →</span>
        </Link>
        {below.length > 0 && (
          <ul className="mt-2 space-y-2">
            {below.map((p) => (
              <ProRow
                key={p.id}
                p={p}
                action={
                  <span className="shrink-0 text-[11px] text-rung-mute">
                    Can ask you
                  </span>
                }
              />
            ))}
          </ul>
        )}
      </Rung>

      <section className="mt-8 rounded-2xl border border-black/[0.06] bg-white p-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-rung-fg">
          <Trophy className="size-4 text-rung-ember" />
          Company leaderboard
        </p>
        <p className="mt-0.5 text-xs text-rung-mute">
          Feedback minutes this week
        </p>
        <ol className="mt-3 space-y-1.5">
          {board.map((row, i) => (
            <li
              key={row.company}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-sm",
                row.company === myCompany
                  ? "bg-[#ffe2c5] font-semibold"
                  : "bg-[#fffcf0]",
              )}
            >
              <span className="flex items-center gap-2 text-rung-fg">
                <span className="w-4 text-xs tabular-nums text-rung-mute">
                  {i + 1}
                </span>
                {row.company}
              </span>
              <span className="tabular-nums text-rung-fg">{row.minutes}m</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
