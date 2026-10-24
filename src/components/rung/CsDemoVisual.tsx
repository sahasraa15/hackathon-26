"use client";

import { motion } from "framer-motion";
import type { ReelVisual } from "@/lib/rung-data";

const halls = [
  { name: "Scott", wait: 12, pct: 78 },
  { name: "Kennedy", wait: 4, pct: 28 },
  { name: "Traditions", wait: 7, pct: 48 },
];

export function CsDemoVisual({ kind }: { kind: ReelVisual }) {
  if (kind === "cs-hook") return <HookScene />;
  if (kind === "cs-live") return <LiveScene />;
  if (kind === "cs-code") return <CodeScene />;
  return <ShipScene />;
}

function HookScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-28 pt-16">
      <motion.p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/80"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Demo day · CSE
      </motion.p>
      <motion.h3
        className="mt-3 text-center text-3xl font-bold tracking-tight text-white"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        Tired of the
        <br />
        dining line?
      </motion.h3>

      <div className="mt-10 flex w-full max-w-[280px] flex-col gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.12, duration: 0.4 }}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-violet-400/30 text-xs font-bold text-violet-100">
              {i + 1}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#e5ccff] to-[#ffffc5]"
                initial={{ width: "8%" }}
                animate={{ width: `${30 + i * 14}%` }}
                transition={{
                  delay: 0.6 + i * 0.1,
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            </div>
            <span className="w-10 text-right text-xs tabular-nums text-white/70">
              {8 + i * 2}m
            </span>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="mt-8 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        QueueLess predicts wait from pings
      </motion.p>
    </div>
  );
}

function LiveScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pb-28 pt-14">
      <motion.div
        className="w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/15 bg-[#0b1220]/95 shadow-2xl"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
          <p className="text-xs font-semibold text-white">Campus map</p>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-300">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative size-1.5 rounded-full bg-emerald-400" />
            </span>
            live · 8s
          </span>
        </div>

        <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900 p-3">
          <div className="absolute inset-3 rounded-xl border border-dashed border-white/10" />
          {[
            { top: "18%", left: "22%", label: "Scott", hot: true },
            { top: "42%", left: "58%", label: "Kenn", hot: false },
            { top: "68%", left: "30%", label: "Trad", hot: false },
          ].map((pin, i) => (
            <motion.div
              key={pin.label}
              className="absolute"
              style={{ top: pin.top, left: pin.left }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
            >
              <span
                className={`block size-3 rounded-full ring-4 ${
                  pin.hot
                    ? "bg-rose-400 ring-rose-400/30"
                    : "bg-emerald-400 ring-emerald-400/30"
                }`}
              />
              <span className="mt-1 block whitespace-nowrap text-[10px] font-semibold text-white/90">
                {pin.label}
              </span>
            </motion.div>
          ))}
        </div>

        <ul className="space-y-0 divide-y divide-white/10">
          {halls.map((h, i) => (
            <motion.li
              key={h.name}
              className="flex items-center gap-3 px-3.5 py-2.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.12 }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{h.name}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${
                      h.wait > 10
                        ? "bg-rose-400"
                        : h.wait > 5
                          ? "bg-amber-300"
                          : "bg-emerald-400"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${h.pct}%` }}
                    transition={{
                      delay: 0.7 + i * 0.1,
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: "mirror",
                      repeatDelay: 1.4,
                    }}
                  />
                </div>
              </div>
              <p className="text-sm font-semibold tabular-nums text-white">
                {h.wait}
                <span className="text-xs font-normal text-white/50"> min</span>
              </p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

function CodeScene() {
  const lines = [
    { c: "text-violet-300", t: "async function eta(hallId) {" },
    { c: "text-slate-400", t: "  const pings = await ws.poll(hallId)" },
    { c: "text-emerald-300", t: "  return rollingAvg(pings, 90)" },
    { c: "text-violet-300", t: "}" },
    { c: "text-slate-500", t: "" },
    { c: "text-amber-200", t: "// Next · WS · Postgres" },
    { c: "text-sky-300", t: "cache.set(hallId, eta, ttl: 8)" },
  ];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pb-28 pt-14">
      <motion.div
        className="w-full max-w-[300px] overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#020617] shadow-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-300/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 text-[10px] text-white/40">eta.ts</span>
        </div>
        <pre className="space-y-1 px-3.5 py-4 font-mono text-[11px] leading-relaxed">
          {lines.map((line, i) => (
            <motion.code
              key={i}
              className={`block ${line.c}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.18 }}
            >
              {line.t || "\u00a0"}
            </motion.code>
          ))}
          <motion.span
            className="mt-1 inline-block h-3.5 w-1.5 bg-emerald-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        </pre>
      </motion.div>

      <motion.div
        className="mt-5 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        {["WebSocket", "rollingAvg", "TTL 8s"].map((t) => (
          <span
            key={t}
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-200"
          >
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function ShipScene() {
  const metrics = [
    { label: "Halls live", value: "3", sub: "pilot" },
    { label: "Avg wait Δ", value: "−4.2m", sub: "vs last week" },
    { label: "Pings / day", value: "1.8k", sub: "campus" },
  ];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pb-28 pt-14">
      <motion.p
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Pilot results
      </motion.p>
      <motion.h3
        className="mt-2 text-2xl font-bold text-white"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        QueueLess shipped
      </motion.h3>

      <div className="mt-8 grid w-full max-w-[300px] grid-cols-1 gap-2.5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.15 }}
          >
            <p className="text-[11px] text-white/55">{m.label}</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-white">
              {m.value}
            </p>
            <p className="text-xs text-violet-200/80">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-6 rounded-full bg-[#e5ccff] px-5 py-2.5 text-sm font-semibold text-[#2a2438]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: "spring" }}
      >
        Remix the model →
      </motion.div>
    </div>
  );
}
