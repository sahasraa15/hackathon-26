"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Check,
  ExternalLink,
  Plus,
  Eye,
  Heart,
  MessageSquare,
  Play,
} from "lucide-react";
import { personById, type Comment } from "@/lib/rung-data";
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

const fieldClass =
  "mt-1 w-full rounded-xl bg-[#fffcf0] px-3 py-2.5 text-sm text-rung-fg outline-none ring-1 ring-black/[0.06] focus:ring-[#c9a6ff]";

function PostProjectForm({ onDone }: { onDone: () => void }) {
  const { postProject, myMajor, exploreMajors } = useRung();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState<string[]>([myMajor]);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-5 space-y-3 rounded-2xl border border-black/[0.06] bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return setError("Give your project a name.");
        if (link.trim() && !/^https?:\/\/\S+\.\S+/.test(link.trim()))
          return setError("Links start with http:// or https://");
        postProject({ title, caption, link, tags });
        onDone();
      }}
    >
      <label className="block">
        <span className="text-xs font-medium text-rung-mute">Project name</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Dorm energy tracker"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-rung-mute">
          One-line pitch + what feedback you want
        </span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          placeholder="What it does, and what you're stuck on"
          className={cn(fieldClass, "resize-none")}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-rung-mute">
          Link (video, GitHub or live demo) · optional
        </span>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://"
          className={fieldClass}
        />
      </label>
      <div>
        <p className="text-xs font-medium text-rung-mute">Tags</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {[myMajor, ...exploreMajors, "Prototype", "Pitch", "Research"].map(
            (t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setTags((prev) =>
                      on ? prev.filter((x) => x !== t) : [...prev, t],
                    )
                  }
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium",
                    on
                      ? "bg-[#e5ccff] text-rung-fg"
                      : "bg-[#fffcf0] text-rung-mute ring-1 ring-black/[0.06]",
                  )}
                >
                  {t}
                </button>
              );
            },
          )}
        </div>
      </div>
      {error && <p className="text-xs font-medium text-[#b42318]">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-full bg-[#e5ccff] py-2.5 text-sm font-semibold text-rung-fg"
        >
          Post · +5 pts
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-black/[0.08] px-4 py-2.5 text-sm text-rung-mute"
        >
          Cancel
        </button>
      </div>
      <p className="text-[11px] text-rung-mute">
        Professionals in your field see it in their feedback queue right away.
      </p>
    </form>
  );
}

export default function MyProjectsPage() {
  const { myDemos: mine, comments, seenFeedback, markFeedbackSeen } = useRung();
  const [posting, setPosting] = useState(false);
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

      {posting ? (
        <PostProjectForm onDone={() => setPosting(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setPosting(true)}
          className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-black/[0.15] bg-white py-3.5 text-sm font-semibold text-rung-fg"
        >
          <Plus className="size-4" />
          Post a project
          <span className="font-normal text-rung-mute">· +5 pts</span>
        </button>
      )}

      {mine.length === 0 && !posting && (
        <p className="mt-4 text-center text-sm text-rung-mute">
          No projects yet. Post one to get notes from professionals, or{" "}
          <Link href="/projects" className="font-medium text-rung-ember">
            join a team →
          </Link>
        </p>
      )}

      <ul className="mt-5 space-y-4">
        {[...mine].reverse().map((d) => {
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
                {d.link && (
                  <a
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-rung-ember"
                  >
                    <ExternalLink className="size-3" />
                    Open demo
                  </a>
                )}
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
