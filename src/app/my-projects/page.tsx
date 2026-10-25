"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Check,
  Eye,
  Heart,
  MessageSquare,
  Play,
} from "lucide-react";
import { YOU_ID, personById, type Comment } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { cn } from "@/lib/utils";

function authorOf(c: Comment) {
  const p = personById(c.authorId);
  return {
    name: c.fromName ?? p.name,
    title:
      c.fromTitle ??
      ([p.workforceRole, p.company].filter(Boolean).join(" · ") || p.role),
    avatar: c.fromName
      ? c.fromName
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase())
          .join("")
      : p.avatar,
    role: p.role,
  };
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-[#fffcf0] px-2 py-2.5 text-center ring-1 ring-black/[0.04]">
      <Icon className="mx-auto size-3.5 text-rung-ember" />
      <p className="mt-1 text-lg font-semibold tabular-nums text-rung-fg">
        {value}
      </p>
      <p className="text-[10px] leading-tight text-rung-mute">{label}</p>
    </div>
  );
}

function FeedbackItem({ c, isNew }: { c: Comment; isNew: boolean }) {
  const { helpfulIds, markHelpful, replies, replyToFeedback } = useRung();
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const a = authorOf(c);
  const helped = helpfulIds.includes(c.id);
  const reply = replies[c.id];

  return (
    <li className="rounded-xl bg-[#fffcf0] p-3 ring-1 ring-black/[0.04]">
      <div className="flex items-start gap-2.5">
        <Avatar initials={a.avatar} role={a.role} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-medium text-rung-fg">
            <span className="truncate">{a.name}</span>
            {isNew && (
              <span className="rounded-full bg-[#e5ccff] px-1.5 py-0.5 text-[9px] font-semibold">
                NEW
              </span>
            )}
          </p>
          <p className="truncate text-[11px] text-rung-mute">{a.title}</p>
          <p className="mt-1.5 text-sm leading-snug text-rung-fg">{c.text}</p>
        </div>
      </div>

      {reply && (
        <p className="ml-10 mt-2 rounded-lg bg-white px-2.5 py-1.5 text-xs text-rung-fg ring-1 ring-black/[0.05]">
          <span className="font-medium">You:</span> {reply}
        </p>
      )}

      {replying && !reply && (
        <form
          className="ml-10 mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            replyToFeedback(c.id, draft);
            setReplying(false);
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Say thanks or ask a follow-up…"
            className="min-w-0 flex-1 rounded-full bg-white px-3 py-1.5 text-xs outline-none ring-1 ring-black/[0.08]"
          />
          <button
            type="submit"
            className="rounded-full bg-[#e5ccff] px-3 py-1.5 text-xs font-semibold"
          >
            Send
          </button>
        </form>
      )}

      <div className="ml-10 mt-2 flex gap-2">
        <button
          type="button"
          disabled={helped}
          onClick={() => markHelpful(c.id)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
            helped
              ? "bg-[#e5ccff] text-rung-fg"
              : "bg-white text-rung-mute ring-1 ring-black/[0.08]",
          )}
        >
          {helped ? <Check className="size-3" /> : <Heart className="size-3" />}
          {helped ? "Marked helpful" : "This helped"}
        </button>
        {!reply && !replying && (
          <button
            type="button"
            onClick={() => setReplying(true)}
            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-rung-mute ring-1 ring-black/[0.08]"
          >
            Reply
          </button>
        )}
      </div>
    </li>
  );
}

export default function MyProjectsPage() {
  const { demos, comments, seenFeedback, markFeedbackSeen } = useRung();
  const mine = demos.filter((d) => d.authorId === YOU_ID);
  const myNotes = comments.filter((c) => mine.some((d) => d.id === c.demoId));
  // Snapshot what was already seen so NEW stays visible this visit (incl. live notes)
  const [seenOnOpen] = useState(() => new Set(seenFeedback));

  useEffect(() => {
    markFeedbackSeen(myNotes.map((c) => c.id));
  }, [myNotes, markFeedbackSeen]);

  return (
    <div className="px-5 pt-4 pb-10">
      <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
        My projects
      </h1>
      <p className="mt-1 text-sm text-rung-mute">
        Who tried, liked and gave notes. Mark notes that helped: the pro earns
        credits.
      </p>

      {mine.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-black/[0.12] p-6 text-center text-sm text-rung-mute">
          No projects yet.{" "}
          <Link href="/projects" className="font-medium text-rung-ember">
            Find one to join →
          </Link>
        </div>
      )}

      <ul className="mt-5 space-y-4">
        {mine.map((d) => {
          const notes = comments.filter(
            (c) => c.demoId === d.id && c.isFeedback,
          );
          const proNotes = notes.filter(
            (c) => c.fromName || personById(c.authorId).role !== "student",
          );
          return (
            <li
              key={d.id}
              className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white"
            >
              <div className={cn("bg-gradient-to-br px-4 py-5", d.gradient)}>
                <p className="text-[11px] font-medium text-rung-mute">
                  {d.mediaLabel}
                </p>
                <h2 className="mt-1 font-semibold text-rung-fg">{d.title}</h2>
                <p className="mt-1 text-xs leading-snug text-rung-fg/80">
                  {d.caption}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 p-3">
                <Stat icon={Play} value={d.tries ?? 0} label="tried it" />
                <Stat icon={Heart} value={d.likes} label="liked" />
                <Stat icon={Eye} value={d.proViews ?? 0} label="pros viewed" />
                <Stat
                  icon={Briefcase}
                  value={proNotes.length}
                  label="pro notes"
                />
              </div>

              <div className="border-t border-black/[0.06] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-rung-fg">
                  <MessageSquare className="size-3.5" />
                  Feedback ({notes.length})
                </p>
                {notes.length === 0 ? (
                  <p className="text-xs text-rung-mute">
                    No notes yet. Professionals in your field will see this in
                    their queue.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {[...notes].reverse().map((c) => (
                      <FeedbackItem
                        key={c.id}
                        c={c}
                        isNew={!seenOnOpen.has(c.id)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
