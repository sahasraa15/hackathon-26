"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clapperboard,
  Compass,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { useRung } from "@/lib/rung-store";
import { DeviceOverlay } from "@/components/rung/DeviceOverlay";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome aboard",
    body: "CollegeConnectors is where you share demos, meet builders, and get mentor help. Takes 30 seconds to learn the map.",
  },
  {
    icon: Clapperboard,
    title: "Feed & Reels",
    body: "Feed = project updates with photos. Reels = full-screen demo walkthroughs. Swipe up on Reels like TikTok.",
  },
  {
    icon: Compass,
    title: "Match",
    body: "Swipe right to connect, left to pass (they come back later). Tap glowing dots on project photos for quick DMs.",
  },
  {
    icon: Users,
    title: "Network & You",
    body: "Network finds people & research. Your profile holds points, portfolio score, and GitHub connect.",
  },
  {
    icon: Settings,
    title: "Settings anytime",
    body: "Change major, campus, or “what I see” (major-only vs everyone) under the gear. Replay this tour there too.",
  },
];

export function Tutorial() {
  const { tutorialDone, setTutorialDone, session } = useRung();
  const [i, setI] = useState(0);

  if (tutorialDone || session !== "student") return null;
  const step = STEPS[i];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <DeviceOverlay>
        <motion.div
          className="flex h-full flex-col justify-end bg-black/35 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={step.title}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-3xl bg-white p-5 shadow-xl"
          >
            <div className="flex gap-1">
              {STEPS.map((_, idx) => (
                <div
                  key={STEPS[idx].title}
                  className={`h-1 flex-1 rounded-full ${
                    idx <= i ? "bg-[#e5ccff]" : "bg-black/[0.06]"
                  }`}
                />
              ))}
            </div>
            <span className="mt-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff59a] to-[#e4c4ff]">
              <Icon className="size-6 text-rung-fg" />
            </span>
            <h2 className="mt-3 font-display text-xl font-extrabold text-rung-fg">
              {step.title}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-rung-mute">
              {step.body}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setTutorialDone(true)}
                className="rounded-full px-4 py-2.5 text-sm font-bold text-rung-mute"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => {
                  if (i >= STEPS.length - 1) setTutorialDone(true);
                  else setI((n) => n + 1);
                }}
                className="flex-1 rounded-full bg-rung-fg py-2.5 text-sm font-extrabold text-[#fff59a]"
              >
                {i >= STEPS.length - 1 ? "Got it — let’s go" : "Next"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </DeviceOverlay>
    </AnimatePresence>
  );
}
