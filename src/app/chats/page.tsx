"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, MessageSquare, SendHorizontal } from "lucide-react";
import { PRO_YOU_ID, demoAuthor, personById } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { cn } from "@/lib/utils";

type Line = {
  id: string;
  mine: boolean;
  text: string;
  at: number;
  note: boolean;
};

type Thread = {
  key: string;
  demoId: string;
  proName: string;
  withName: string;
  title: string;
  lines: Line[];
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/** One thread per (project, professional): the pro's notes plus the chat that followed. */
export default function ChatsPage() {
  const { session, you, demos, myDemos, comments, chat, sendChat } = useRung();
  const pro = session === "professional";
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const threads = useMemo(() => {
    const byKey = new Map<string, Thread>();
    const mineIds = new Set(myDemos.map((d) => d.id));
    const thread = (demoId: string, proName: string) => {
      const key = `${demoId}::${proName}`;
      let t = byKey.get(key);
      if (!t) {
        const d = demos.find((x) => x.id === demoId);
        t = {
          key,
          demoId,
          proName,
          withName: pro ? (d ? demoAuthor(d).name : "Student") : proName,
          title: d?.title ?? "Project",
          lines: [],
        };
        byKey.set(key, t);
      }
      return t;
    };

    for (const c of comments) {
      if (!c.isFeedback) continue;
      if (pro) {
        if (c.authorId !== PRO_YOU_ID) continue;
        thread(c.demoId, you.name).lines.push({
          id: c.id,
          mine: true,
          text: c.text,
          at: c.at ?? 0,
          note: true,
        });
      } else {
        if (!mineIds.has(c.demoId)) continue;
        const author = personById(c.authorId);
        if (!c.fromName && author.role === "student") continue;
        thread(c.demoId, c.fromName ?? author.name).lines.push({
          id: c.id,
          mine: false,
          text: c.text,
          at: c.at ?? 0,
          note: true,
        });
      }
    }
    for (const m of chat) {
      thread(m.demoId, m.proName).lines.push({
        id: m.id,
        mine: (m.from === "pro") === pro,
        text: m.text,
        at: m.at,
        note: false,
      });
    }
    const list = [...byKey.values()];
    list.forEach((t) => t.lines.sort((a, b) => a.at - b.at));
    return list.sort(
      (a, b) => (b.lines.at(-1)?.at ?? 0) - (a.lines.at(-1)?.at ?? 0),
    );
  }, [comments, chat, demos, myDemos, pro, you.name]);

  const open = threads.find((t) => t.key === openKey) ?? null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [open?.lines.length]);

  if (open) {
    return (
      <div className="flex min-h-full flex-col px-5 pt-4 pb-28">
        <button
          type="button"
          onClick={() => setOpenKey(null)}
          className="flex items-center gap-1 self-start text-sm text-rung-mute"
        >
          <ChevronLeft className="size-4" /> Messages
        </button>
        <div className="mt-3 flex items-center gap-3">
          <Avatar
            initials={initials(open.withName)}
            role={pro ? "student" : "industry"}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-rung-fg">
              {open.withName}
            </p>
            <p className="truncate text-xs text-rung-mute">
              About “{open.title}”
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {open.lines.map((l) => (
            <li
              key={l.id}
              className={cn("flex", l.mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                  l.mine
                    ? "rounded-br-sm bg-[#e5ccff] text-rung-fg"
                    : "rounded-bl-sm bg-white text-rung-fg ring-1 ring-black/[0.06]",
                )}
              >
                {l.note && (
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-rung-mute">
                    Feedback note
                  </span>
                )}
                {l.text}
              </div>
            </li>
          ))}
        </ul>
        <div ref={endRef} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendChat(open.demoId, open.proName, draft);
            setDraft("");
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${open.withName.split(" ")[0]}…`}
            aria-label="Message"
            className="min-w-0 flex-1 rounded-full bg-white px-3.5 py-2.5 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-[#c9a6ff]"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e5ccff]"
          >
            <SendHorizontal className="size-4 text-rung-fg" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-10">
      <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
        Messages
      </h1>
      <p className="mt-1 text-sm text-rung-mute">
        {pro
          ? "Every note you send starts a thread with that student."
          : "Feedback from professionals, and the conversations that follow."}
      </p>

      {threads.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-black/[0.12] p-6 text-center text-sm text-rung-mute">
          <MessageSquare className="size-5" />
          <p className="mt-2">
            {pro
              ? "Send a feedback note to start a conversation."
              : "Post a project to start getting notes."}
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {threads.map((t) => {
            const last = t.lines.at(-1);
            return (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => setOpenKey(t.key)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 text-left active:bg-[#f6efff]"
                >
                  <Avatar
                    initials={initials(t.withName)}
                    role={pro ? "student" : "industry"}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-rung-fg">
                        {t.withName}
                      </span>
                      <span className="shrink-0 text-[10px] text-rung-mute">
                        {t.lines.length} msgs
                      </span>
                    </span>
                    <span className="block truncate text-[11px] text-rung-mute">
                      {t.title}
                    </span>
                    <span className="block truncate text-xs text-rung-fg">
                      {last?.mine ? "You: " : ""}
                      {last?.text}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
