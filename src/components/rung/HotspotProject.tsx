"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProjectHotspot } from "@/lib/rung-data";
import { cn } from "@/lib/utils";

export function HotspotProject({
  image,
  hotspots,
  onAsk,
  className,
}: {
  image: string;
  hotspots: ProjectHotspot[];
  onAsk?: (prompt: string) => void;
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const spot = hotspots.find((h) => h.id === active);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="Project preview"
        className="aspect-[4/3] w-full object-cover"
        draggable={false}
      />
      {hotspots.map((h) => (
        <button
          key={h.id}
          type="button"
          aria-label={h.label}
          onClick={(e) => {
            e.stopPropagation();
            setActive(active === h.id ? null : h.id);
          }}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
        >
          <span className="relative flex size-8 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#e5ccff]/70" />
            <span
              className={cn(
                "relative flex size-7 items-center justify-center rounded-full text-[10px] font-bold shadow-md ring-2 ring-white",
                active === h.id
                  ? "bg-rung-fg text-white"
                  : "bg-[#e5ccff] text-rung-fg",
              )}
            >
              {h.label.slice(0, 1)}
            </span>
          </span>
        </button>
      ))}

      <AnimatePresence>
        {spot && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute inset-x-2 bottom-2 z-20 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rung-ember">
              {spot.label}
            </p>
            <p className="mt-1 text-sm leading-snug text-rung-fg">{spot.tip}</p>
            {spot.dmPrompt && onAsk && (
              <button
                type="button"
                onClick={() => {
                  onAsk(spot.dmPrompt!);
                  setActive(null);
                }}
                className="mt-2.5 w-full rounded-full bg-[#e5ccff] py-2 text-xs font-semibold text-rung-fg"
              >
                Use as message
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
