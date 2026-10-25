"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, SendHorizontal, X } from "lucide-react";
import { ratingTone, tierForPoints } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";

type Msg = { role: "bot" | "you"; text: string };

function reply(
  input: string,
  ctx: {
    points: number;
    githubRating: number;
    session: string | null;
    tierName: string;
  },
): string {
  const q = input.toLowerCase();
  const tone = ratingTone(ctx.githubRating);

  if (
    q.includes("github") ||
    q.includes("rating") ||
    q.includes("portfolio") ||
    q.includes("score")
  ) {
    return `Portfolio score ${ctx.githubRating} (${tone.label}). ${tone.tip} Works for papers, labs, design, music, code — tap “Review my work” below.`;
  }
  if (
    q.includes("bump") ||
    q.includes("review my") ||
    q.includes("ai")
  ) {
    return "Reviewing your recent posts & reels (demo). Tap the button below to bump your score.";
  }
  if (q.includes("tier") || q.includes("gold") || q.includes("platinum")) {
    return `You’re ${ctx.tierName} with ${ctx.points} pts. Gold unlocks professor mentor videos. Platinum unlocks sponsor projects (Google, Honda, …). Open Tiers in the nav to see the full ladder.`;
  }
  if (q.includes("sponsor") || q.includes("google") || q.includes("company")) {
    return ctx.session === "professional"
      ? "Companies get free brand on sponsor briefs. Your feedback minutes today roll into the monthly bonus. Post problems students fix for credit — not pay."
      : "Sponsor projects appear at Platinum. Students fix real company problems for experience & credit — companies get brand + pipeline without a job-board vibe.";
  }
  if (q.includes("college") || q.includes("research")) {
    return "Everyone is visible by default. Use Network → college filter to sort. Research labs can message students whose project tags match what they’re hiring for.";
  }
  if (q.includes("mentor") || q.includes("mentee")) {
    return "Students: Match + Mentors shop. Pros: connect up/down by workforce role and GitHub rating, or offer mentee slots from Feedback.";
  }
  if (q.includes("help") || q.includes("how")) {
    return "Try asking about: github rating, tiers, sponsors, college filter, or mentors. I’m the in-app guide for this demo.";
  }
  return `Got it. You’re on the ${ctx.session ?? "guest"} path as ${ctx.tierName}. Ask about GitHub rating, tiers, sponsors, or college research — or say “help”.`;
}

export function HelpChat() {
  const {
    session,
    points,
    githubRating,
    tier,
    applyGithubAiBump,
  } = useRung();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Ask me about tiers, portfolio score, sponsors, or research.",
    },
  ]);

  const ctx = useMemo(
    () => ({
      points,
      githubRating,
      session,
      tierName: tier.name,
    }),
    [points, githubRating, session, tier.name],
  );

  if (!session) return null;

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMsgs((m) => [...m, { role: "you", text: trimmed }]);
    const bot = reply(trimmed, ctx);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "bot", text: bot }]);
      if (
        trimmed.toLowerCase().includes("bump github") ||
        trimmed.toLowerCase().includes("review my")
      ) {
        /* user still taps button */
      }
    }, 350);
    setDraft("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-20 right-3 z-40 flex size-12 items-center justify-center rounded-full bg-[#e5ccff] text-rung-fg shadow-md"
        aria-label="Open help chat"
      >
        <MessageCircle className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="absolute bottom-20 right-3 z-50 flex h-[420px] w-[min(100%-1.5rem,320px)] flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#f6efff] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-rung-ember" />
                <div>
                  <p className="text-sm font-semibold text-rung-fg">Help</p>
                  <p className="text-[10px] text-rung-mute">
                    Portfolio AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-rung-mute"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
              {msgs.map((m, i) => (
                <div
                  key={`${i}-${m.text.slice(0, 12)}`}
                  className={
                    m.role === "you"
                      ? "ml-6 rounded-2xl bg-[#e5ccff] px-3 py-2 text-sm text-rung-fg"
                      : "mr-4 rounded-2xl bg-[#fffcf5] px-3 py-2 text-sm text-rung-fg"
                  }
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="border-t border-black/[0.06] p-2">
              <button
                type="button"
                onClick={() => {
                  applyGithubAiBump();
                  setMsgs((m) => [
                    ...m,
                    {
                      role: "bot",
                      text: `Score → ${Math.min(100, githubRating + 4)}. Tier: ${tierForPoints(points + 2).name}.`,
                    },
                  ]);
                }}
                className="mb-2 w-full rounded-xl bg-[#f6efff] py-2 text-xs font-semibold text-rung-ember"
              >
                Review my work
              </button>
              <form
                className="flex gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(draft);
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask anything…"
                  className="flex-1 rounded-full bg-[#fffcf5] px-3 py-2 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-[#e5ccff]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#e5ccff] p-2 text-rung-fg"
                  aria-label="Send"
                >
                  <SendHorizontal className="size-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
