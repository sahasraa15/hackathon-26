"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DeviceOverlay } from "@/components/rung/DeviceOverlay";

const halls = [
  { id: "scott", name: "Scott", base: 11 },
  { id: "kennedy", name: "Kennedy", base: 4 },
  { id: "traditions", name: "Traditions", base: 7 },
] as const;

export function TryQueueLess({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<(typeof halls)[number]["id"] | null>(
    null,
  );
  const [eta, setEta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const run = (id: (typeof halls)[number]["id"]) => {
    const hall = halls.find((h) => h.id === id)!;
    setPicked(id);
    setLoading(true);
    setEta(null);
    window.setTimeout(() => {
      const jitter = Math.round((Math.random() - 0.35) * 4);
      setEta(Math.max(1, hall.base + jitter));
      setLoading(false);
    }, 700);
  };

  return (
    <AnimatePresence>
      {open && (
        <DeviceOverlay>
          <motion.div
            className="flex h-full flex-col bg-[#0b1220] text-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-[max(2.5rem,env(safe-area-inset-top))] sm:pt-14">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200/70">
                  Try it
                </p>
                <p className="text-lg font-semibold">QueueLess</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white/10 p-2"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="px-4 text-sm text-white/65">
              Pick a hall — fake live ETA from the demo model.
            </p>

            <div className="mt-5 space-y-2 px-4">
              {halls.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => run(h.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
                    picked === h.id
                      ? "border-violet-300/50 bg-violet-400/20"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="font-medium">{h.name}</span>
                  <span className="text-xs text-white/50">tap for ETA</span>
                </button>
              ))}
            </div>

            <div className="mt-auto px-4 pb-10">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                {loading ? (
                  <motion.p
                    className="text-sm text-violet-200"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    polling pings…
                  </motion.p>
                ) : eta != null ? (
                  <>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Predicted wait
                    </p>
                    <p className="mt-1 text-5xl font-semibold tabular-nums">
                      {eta}
                      <span className="text-lg font-normal text-white/50">
                        {" "}
                        min
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-violet-200/80">
                      rollingAvg · TTL 8s · demo only
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-white/45">No hall selected yet</p>
                )}
              </div>
            </div>
          </motion.div>
        </DeviceOverlay>
      )}
    </AnimatePresence>
  );
}
