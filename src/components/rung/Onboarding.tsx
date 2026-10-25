"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={i}
            animate={{ width: i === step ? 22 : 8 }}
            className={cn(
              "h-2 rounded-full",
              i <= step ? "bg-rung-ember" : "bg-black/[0.08]",
            )}
          />
        ))}
      </div>
      <span className="text-[11px] text-rung-mute">
        Step {step + 1} of {total}
      </span>
    </div>
  );
}

/** Wrap each step's content; give it `key={step}` inside AnimatePresence. */
export function StepPanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const burst = ["#e5ccff", "#ffe2c5", "#ffffc5", "#c9a86a", "#6b4db8", "#e5ccff", "#ffe2c5", "#ffffc5"];

export function Celebration({
  title,
  points,
  children,
}: {
  title: string;
  points: number;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mt-6 flex size-40 items-center justify-center">
        {burst.map((c, i) => {
          const angle = (i / burst.length) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute size-3 rounded-full"
              style={{ background: c }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              animate={{
                x: Math.cos(angle) * 70,
                y: Math.sin(angle) * 70,
                opacity: [0, 1, 1, 0.8],
                scale: 1,
              }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            />
          );
        })}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}
          className="flex size-24 flex-col items-center justify-center rounded-full bg-[#e5ccff]"
        >
          <span className="text-2xl font-semibold tabular-nums text-rung-fg">
            +{points}
          </span>
          <span className="text-[10px] font-medium text-rung-mute">points</span>
        </motion.div>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg"
      >
        {title}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-6 w-full space-y-2"
      >
        {children}
      </motion.div>
    </div>
  );
}
