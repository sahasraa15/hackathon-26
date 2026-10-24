"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, X } from "lucide-react";
import { personById, sameMajorFamily, stories } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { DeviceOverlay } from "@/components/rung/DeviceOverlay";

const statusCopy = {
  building: "Building now",
  stuck: "Needs a hand",
  shipped: "Just shipped",
} as const;

export function StoriesBar() {
  const { sendMessage, setQuestion, myMajor, majorOnly } = useRung();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const visible = useMemo(() => {
    if (!majorOnly) return stories;
    return stories.filter((s) =>
      sameMajorFamily(personById(s.authorId).major, myMajor),
    );
  }, [majorOnly, myMajor]);

  const story = activeIdx != null ? visible[activeIdx] : null;
  const author = story ? personById(story.authorId) : null;

  useEffect(() => {
    setActiveIdx(null);
    setFeedbackOpen(false);
  }, [myMajor, majorOnly]);

  useEffect(() => {
    if (activeIdx == null || feedbackOpen) return;
    const t = window.setTimeout(() => {
      if (activeIdx < visible.length - 1) setActiveIdx(activeIdx + 1);
      else setActiveIdx(null);
    }, 5200);
    return () => window.clearTimeout(t);
  }, [activeIdx, feedbackOpen, visible.length]);

  const submitFeedback = () => {
    if (!story || !draft.trim()) return;
    sendMessage(story.authorId, draft.trim());
    setQuestion(draft.trim());
    setDraft("");
    setFeedbackOpen(false);
  };

  if (visible.length === 0) {
    return (
      <p className="px-5 py-3 text-xs text-rung-mute">
        No {myMajor} stories right now.
      </p>
    );
  }

  return (
    <>
      <div className="flex gap-3.5 overflow-x-auto px-5 py-4 scrollbar-none">
        {visible.map((s, i) => {
          const p = personById(s.authorId);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveIdx(i);
                setFeedbackOpen(false);
              }}
              className="flex w-14 shrink-0 flex-col items-center gap-1.5"
            >
              <div className="rounded-full bg-gradient-to-tr from-[#e5ccff] to-[#ffe2c5] p-[2px]">
                <div className="overflow-hidden rounded-full bg-[#fffcf0] p-[2px]">
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.image}
                      alt=""
                      className="size-11 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar initials={p.avatar} role={p.role} size="md" />
                  )}
                </div>
              </div>
              <span className="w-full truncate text-center text-[10px] text-rung-mute">
                {p.handle}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {story && author && (
          <DeviceOverlay>
            <motion.div
              className="relative flex h-full flex-col bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {story.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a2438] to-[#6b4db8]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/45" />

              <div className="relative z-10 flex gap-1 px-3 pt-[max(2.75rem,env(safe-area-inset-top))] sm:pt-14">
                {visible.map((s, i) => (
                  <div
                    key={s.id}
                    className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25"
                  >
                    {i === activeIdx && !feedbackOpen && (
                      <motion.div
                        key={s.id + String(activeIdx)}
                        className="h-full bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5.2, ease: "linear" }}
                      />
                    )}
                    {i < (activeIdx ?? 0) && (
                      <div className="h-full w-full bg-white" />
                    )}
                  </div>
                ))}
              </div>

              <div className="relative z-10 flex items-center justify-between px-4 pt-3">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={author.avatar} role={author.role} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {author.name}
                    </p>
                    <p className="text-[11px] text-white/70">
                      {statusCopy[story.status]} · {story.hoursAgo}h
                      {author.major ? ` · ${author.major}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setActiveIdx(null)}
                  className="rounded-full p-2 text-white/80"
                >
                  <X className="size-5" />
                </button>
              </div>

              <button
                type="button"
                className="absolute inset-y-24 left-0 z-10 w-1/3"
                aria-label="Previous"
                onClick={() =>
                  setActiveIdx((i) => (i == null || i <= 0 ? i : i - 1))
                }
              />
              <button
                type="button"
                className="absolute inset-y-24 right-0 z-10 w-1/3"
                aria-label="Next"
                onClick={() => {
                  if (activeIdx == null) return;
                  if (activeIdx >= visible.length - 1) setActiveIdx(null);
                  else setActiveIdx(activeIdx + 1);
                }}
              />

              <div className="relative z-10 mt-auto px-5 pb-6">
                <p className="text-2xl font-semibold leading-snug text-white drop-shadow">
                  {story.text}
                </p>

                {!feedbackOpen ? (
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(true)}
                    className="mt-6 flex w-full flex-col items-center gap-1 text-white/90"
                  >
                    <ChevronUp className="size-5 animate-bounce" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Swipe up · leave feedback
                    </span>
                  </button>
                ) : (
                  <motion.form
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-4 rounded-2xl bg-white p-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitFeedback();
                    }}
                  >
                    <p className="px-1 text-xs font-medium text-rung-mute">
                      Feedback for @{author.handle}
                    </p>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Be specific…"
                      autoFocus
                      className="mt-2 w-full rounded-xl bg-[#fffcf0] px-3 py-2.5 text-sm text-rung-fg outline-none ring-1 ring-black/[0.06]"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFeedbackOpen(false)}
                        className="flex-1 rounded-full py-2.5 text-sm font-medium text-rung-mute"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-full bg-[#e5ccff] py-2.5 text-sm font-semibold text-rung-fg"
                      >
                        Send
                      </button>
                    </div>
                  </motion.form>
                )}
              </div>
            </motion.div>
          </DeviceOverlay>
        )}
      </AnimatePresence>
    </>
  );
}
