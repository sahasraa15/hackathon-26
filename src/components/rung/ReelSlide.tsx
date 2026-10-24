"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Play,
  Repeat2,
  SendHorizontal,
  X,
} from "lucide-react";
import { personById } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { CsDemoVisual } from "@/components/rung/CsDemoVisual";
import { TryQueueLess } from "@/components/rung/TryQueueLess";
import { cn } from "@/lib/utils";

export function ReelSlide({ demoId }: { demoId: string }) {
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
  const [tryOpen, setTryOpen] = useState(false);
  const [draft, setDraft] = useState("");

  if (!demo) return null;
  const author = personById(demo.authorId);
  const thread = comments.filter((c) => c.demoId === demo.id);
  const isLiked = liked.has(demo.id);
  const isRemixed = remixed.has(demo.id);
  const isCsDemo = Boolean(demo.visual?.startsWith("cs-"));

  return (
    <section className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden">
      <div className={cn("absolute inset-0 bg-gradient-to-br", demo.gradient)} />
      {demo.visual ? (
        <CsDemoVisual kind={demo.visual} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

      <div className="absolute left-4 right-16 top-[max(3.5rem,env(safe-area-inset-top))] z-10 sm:top-12">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
          {demo.mediaLabel}
        </p>
      </div>

      <div className="absolute bottom-6 left-4 right-16 z-10">
        <div className="mb-3 flex items-center gap-2">
          <Avatar initials={author.avatar} role={author.role} size="sm" />
          <div>
            <p className="text-sm font-semibold text-white">{author.name}</p>
            <p className="text-xs text-white/75">
              {author.major} · @{author.handle}
            </p>
          </div>
        </div>
        <h2 className="text-xl font-bold leading-snug text-white drop-shadow">
          {demo.title}
        </h2>
        <p className="mt-2 text-sm leading-snug text-white/90">{demo.caption}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {demo.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] text-white backdrop-blur"
            >
              #{t}
            </span>
          ))}
        </div>
        {isCsDemo && (
          <button
            type="button"
            onClick={() => setTryOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e5ccff] px-4 py-2.5 text-sm font-semibold text-rung-fg"
          >
            <Play className="size-4 fill-current" />
            Try QueueLess
          </button>
        )}
      </div>

      <div className="absolute bottom-8 right-3 z-10 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => toggleLike(demo.id)}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-black/35 backdrop-blur">
            <Heart
              className={cn("size-6", isLiked && "fill-[#e5ccff] text-[#e5ccff]")}
            />
          </span>
          <span className="text-xs font-medium">{demo.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-black/35 backdrop-blur">
            <MessageCircle className="size-6" />
          </span>
          <span className="text-xs font-medium">{thread.length}</span>
        </button>
        <button
          type="button"
          disabled={isRemixed}
          onClick={() => remixDemo(demo.id)}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-black/35 backdrop-blur">
            <Repeat2 className={cn("size-6", isRemixed && "text-[#e5ccff]")} />
          </span>
          <span className="text-xs font-medium">
            {isRemixed ? "Done" : "Remix"}
          </span>
        </button>
      </div>

      <TryQueueLess open={tryOpen} onClose={() => setTryOpen(false)} />

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 z-30 flex items-end bg-black/50"
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
              className="flex max-h-[55%] w-full flex-col rounded-t-3xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-black/10" />
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-semibold text-rung-fg">Feedback</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-rung-mute"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
                {thread.map((c) => {
                  const a = personById(c.authorId);
                  return (
                    <div key={c.id} className="flex gap-2.5">
                      <Avatar initials={a.avatar} role={a.role} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-rung-fg">
                          {a.handle}
                        </p>
                        <p className="text-sm text-rung-fg/90">{c.text}</p>
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
                  placeholder="Feedback…"
                  className="flex-1 rounded-full bg-[#fffcf0] px-4 py-2.5 text-sm outline-none ring-1 ring-black/[0.06]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#e5ccff] p-2.5 text-rung-fg"
                >
                  <SendHorizontal className="size-5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
