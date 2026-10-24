"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Repeat2,
  SendHorizontal,
  X,
} from "lucide-react";
import { personById } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { cn } from "@/lib/utils";

export function DemoCard({ demoId }: { demoId: string }) {
  const {
    demos,
    comments,
    liked,
    remixed,
    toggleLike,
    addFeedback,
    remixDemo,
  } = useRung();
  const demo = demos.find((d) => d.id === demoId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [remixFlash, setRemixFlash] = useState(false);

  if (!demo) return null;
  const author = personById(demo.authorId);
  const thread = comments.filter((c) => c.demoId === demo.id);
  const isLiked = liked.has(demo.id);
  const isRemixed = remixed.has(demo.id);

  return (
    <>
      <article className="border-b border-black/[0.06] pb-6">
        <div className="flex items-center gap-3 px-5 py-3">
          <Avatar initials={author.avatar} role={author.role} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-rung-fg">
              {author.name}
              <span className="font-normal text-rung-mute">
                {" "}
                @{author.handle}
              </span>
            </p>
            <p className="truncate text-xs text-rung-mute">
              {author.college}
              {author.major || author.company || author.department
                ? ` · ${author.major || author.company || author.department}`
                : ""}
            </p>
          </div>
          <span className="rounded-full bg-[#f6efff] px-2.5 py-1 text-[10px] font-medium text-rung-mute">
            {author.major}
          </span>
        </div>

        <div
          className={cn(
            "relative mx-5 aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br",
            demo.gradient,
          )}
        >
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <span className="w-fit rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-rung-fg">
              {demo.mediaLabel}
            </span>
            <div>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight text-rung-fg">
                {demo.title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {demo.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-rung-fg/75"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center px-3 pt-2">
          <button
            type="button"
            onClick={() => toggleLike(demo.id)}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-rung-fg"
          >
            <Heart
              className={cn(
                "size-5",
                isLiked && "fill-rung-ember text-rung-ember",
              )}
            />
            {demo.likes}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-rung-fg"
          >
            <MessageCircle className="size-5" />
            {thread.length}
          </button>
          <button
            type="button"
            disabled={isRemixed}
            onClick={() => {
              remixDemo(demo.id);
              setRemixFlash(true);
              setTimeout(() => setRemixFlash(false), 1500);
            }}
            className={cn(
              "ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium",
              isRemixed ? "text-rung-ember" : "text-rung-fg",
            )}
          >
            <Repeat2 className="size-5" />
            {isRemixed ? "Remixed" : "Remix"}
          </button>
        </div>

        <p className="px-5 pt-1 text-sm leading-relaxed text-rung-fg/90">
          <span className="font-semibold">{author.handle}</span> {demo.caption}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-5 pt-2 text-sm text-rung-mute"
        >
          View feedback ({thread.length})
        </button>
      </article>

      <AnimatePresence>
        {remixFlash && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#e5ccff] px-4 py-2 text-sm font-medium text-rung-fg shadow-lg"
          >
            +5 pts · remix started
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="flex max-h-[75dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white sm:max-w-[402px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-black/10" />
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-semibold text-rung-fg">Feedback</p>
                  <p className="text-xs text-rung-mute">+3 pts for useful notes</p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-rung-mute"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-2">
                {thread.map((c) => {
                  const a = personById(c.authorId);
                  return (
                    <div key={c.id} className="flex gap-3">
                      <Avatar initials={a.avatar} role={a.role} size="sm" />
                      <div>
                        <p className="text-xs text-rung-mute">
                          <span className="font-semibold text-rung-fg">
                            {a.handle}
                          </span>
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-rung-fg/90">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                className="flex gap-2 border-t border-black/[0.06] p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  addFeedback(demo.id, draft);
                  setDraft("");
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Leave useful feedback…"
                  className="flex-1 rounded-full bg-[#fffcf0] px-4 py-2.5 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-[#e5ccff]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#e5ccff] p-2.5 text-rung-fg"
                  aria-label="Send"
                >
                  <SendHorizontal className="size-5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
