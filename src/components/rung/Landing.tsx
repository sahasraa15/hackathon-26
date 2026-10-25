"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const peeks = [
  {
    initials: "KN",
    name: "Kai",
    blurb: "just dropped a QueueLess reel",
    hue: "from-[#fff59a] to-[#f5ecff]",
  },
  {
    initials: "MP",
    name: "Maya",
    blurb: "looking for a paper swap",
    hue: "from-[#e4c4ff] to-[#f0e0ff]",
  },
  {
    initials: "JL",
    name: "Jordan",
    blurb: "open for poster critiques",
    hue: "from-[#f0e0ff] to-[#fff59a]",
  },
  {
    initials: "PN",
    name: "Priya",
    blurb: "needs a frontend buddy",
    hue: "from-[#fff59a] to-[#e4c4ff]",
  },
];

const rotating = ["demos", "classmates", "mentors", "collabs"];

const sparks = [
  { x: "8%", y: "28%", size: 10, delay: 0, color: "#fff59a" },
  { x: "86%", y: "34%", size: 8, delay: 0.4, color: "#e4c4ff" },
  { x: "72%", y: "18%", size: 6, delay: 0.9, color: "#f0e0ff" },
  { x: "18%", y: "72%", size: 7, delay: 1.2, color: "#e4c4ff" },
];

export function Landing() {
  const [activePerson, setActivePerson] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [linked, setLinked] = useState(false);
  const [paused, setPaused] = useState(false);
  const person = peeks[activePerson];
  const nextPerson = peeks[(activePerson + 1) % peeks.length];

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActivePerson((i) => (i + 1) % peeks.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setWordIdx((i) => (i + 1) % rotating.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setLinked(false);
    const t = window.setTimeout(() => setLinked(true), 280);
    return () => window.clearTimeout(t);
  }, [activePerson]);

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-[#fbf8ff]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 10% 0%, #fff59a 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 15%, #e4c4ff 0%, transparent 50%), radial-gradient(ellipse 80% 45% at 70% 100%, #f0e0ff 0%, transparent 55%), linear-gradient(168deg, #fffcf5 0%, #f6efff 45%, #fbf8ff 100%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(44,31,58,0.35) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 18%, black 70%, transparent 100%)",
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-36 size-52 rounded-full bg-[#fff59a]/55 blur-3xl"
        animate={{ y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-14 bottom-36 size-48 rounded-full bg-[#e4c4ff]/50 blur-3xl"
        animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {sparks.map((s) => (
        <motion.span
          key={`${s.x}-${s.y}`}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 12px ${s.color}`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.35, 0.95, 0.35],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 3.6,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 flex min-h-full flex-1 flex-col px-7 pb-10 pt-[5.75rem] sm:pt-[5.5rem]">
        <div>
          <motion.p
            className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9b6bd6]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            HackOHI/O · Bridge Builder
          </motion.p>

          <h1 className="font-display text-[2.65rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-[#2c1f3a]">
            {"College".split("").map((ch, i) => (
              <motion.span
                key={`c-${i}`}
                className="inline-block"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.04 * i,
                  type: "spring",
                  stiffness: 380,
                  damping: 20,
                }}
              >
                {ch}
              </motion.span>
            ))}
            <br />
            <span className="relative inline-block">
              {"Connectors".split("").map((ch, i) => (
                <motion.span
                  key={`n-${i}`}
                  className="inline-block"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.22 + 0.035 * i,
                    type: "spring",
                    stiffness: 380,
                    damping: 20,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
              <motion.span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-[#fff59a] to-[#e4c4ff]"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.55, ease: "easeOut" }}
              />
            </span>
          </h1>

          <motion.p
            className="mt-4 max-w-[17rem] text-[15px] font-semibold leading-relaxed text-[#6e6278]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            Your campus build feed for{" "}
            <span className="relative inline-block min-w-[6.5rem] text-[#2c1f3a]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotating[wordIdx]}
                  className="absolute left-0 top-0 font-extrabold text-[#9b6bd6]"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.28 }}
                >
                  {rotating[wordIdx]}
                </motion.span>
              </AnimatePresence>
              <span className="invisible font-extrabold">classmates</span>
            </span>
            .
          </motion.p>
        </div>

        <div className="min-h-6 flex-1" />

        <motion.div
          className="relative overflow-hidden rounded-[1.9rem] bg-white/70 p-4 shadow-[0_14px_40px_rgba(80,40,60,0.1)] ring-1 ring-white/90 backdrop-blur-md"
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 240, damping: 22 }}
          onPointerDown={() => setPaused(true)}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#9b6bd6]">
              Watch a link form
            </p>
            <motion.button
              type="button"
              onClick={() => {
                setPaused(true);
                setActivePerson((i) => (i + 1) % peeks.length);
              }}
              className="rounded-full bg-gradient-to-r from-[#fff59a] to-[#e4c4ff] px-2.5 py-1 text-[10px] font-extrabold text-[#2c1f3a]"
              whileTap={{ scale: 0.94 }}
            >
              next →
            </motion.button>
          </div>

          <div className="relative mt-5 flex h-[5.5rem] items-center justify-between px-2">
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-x-8 inset-y-0 h-full w-[calc(100%-4rem)]"
              viewBox="0 0 200 88"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M12 44 C 70 8, 130 80, 188 44"
                fill="none"
                stroke="url(#linkGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: linked ? 1 : 0,
                  opacity: linked ? 1 : 0,
                }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fff59a" />
                  <stop offset="100%" stopColor="#9b6bd6" />
                </linearGradient>
              </defs>
            </svg>

            <PeekOrb
              person={person}
              selected
              onClick={() => {
                setPaused(true);
              }}
            />

            <motion.div
              className="z-10 flex flex-col items-center"
              animate={{ scale: linked ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.45 }}
            >
              <motion.span
                className="rounded-full bg-[#2c1f3a] px-2.5 py-1 text-[10px] font-extrabold text-[#fff59a]"
                animate={{ y: linked ? [0, -3, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                {linked ? "linked" : "…"}
              </motion.span>
            </motion.div>

            <PeekOrb
              person={nextPerson}
              selected={false}
              onClick={() => {
                setPaused(true);
                setActivePerson((i) => (i + 1) % peeks.length);
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={`${person.name}-${nextPerson.name}`}
              className="mt-2 text-sm font-bold leading-snug text-[#2c1f3a]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <span className="text-[#9b6bd6]">{person.name}</span>
              {" meets "}
              <span className="text-[#9b6bd6]">{nextPerson.name}</span>
              <span className="mt-1 block text-xs font-semibold text-[#6e6278]">
                {person.blurb}
              </span>
            </motion.p>
          </AnimatePresence>

          <div className="mt-3.5 flex -space-x-2">
            {peeks.map((p, i) => {
              const on = i === activePerson;
              return (
                <motion.button
                  key={p.initials}
                  type="button"
                  onClick={() => {
                    setPaused(true);
                    setActivePerson(i);
                  }}
                  className={`relative flex size-9 items-center justify-center rounded-full bg-gradient-to-br ${p.hue} text-[10px] font-extrabold text-[#2c1f3a] ring-2 ${
                    on ? "z-10 ring-[#2c1f3a]" : "ring-white"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: on ? 1.12 : 1 }}
                  aria-label={`Show ${p.name}`}
                >
                  {p.initials}
                </motion.button>
              );
            })}
            <div className="flex size-9 items-center justify-center rounded-full bg-[#fff59a] text-[10px] font-extrabold text-[#2c1f3a] ring-2 ring-white">
              +8
            </div>
          </div>
        </motion.div>

        <div className="min-h-6 flex-1" />

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/signup"
              className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-[#2c1f3a] py-[1.05rem] text-[15px] font-extrabold text-[#fffcf5] shadow-[0_12px_28px_rgba(44,31,58,0.22)]"
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/15"
                animate={{ x: ["0%", "350%"] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatDelay: 1.6,
                  ease: "easeInOut",
                }}
              />
              Create account
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-full bg-white/85 py-3.5 text-[15px] font-bold text-[#2c1f3a] ring-1 ring-[#2c1f3a]/08"
            >
              Log in
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function PeekOrb({
  person,
  selected,
  onClick,
}: {
  person: (typeof peeks)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative z-10 flex size-14 items-center justify-center rounded-full bg-gradient-to-br ${person.hue} text-sm font-extrabold text-[#2c1f3a] shadow-[0_8px_20px_rgba(80,40,60,0.12)] ring-[3px] ${
        selected ? "ring-[#2c1f3a]" : "ring-white"
      }`}
      whileTap={{ scale: 0.92 }}
      animate={{
        y: selected ? [0, -4, 0] : 0,
        scale: selected ? 1.05 : 1,
      }}
      transition={{
        y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 400, damping: 18 },
      }}
      aria-label={person.name}
    >
      {person.initials}
      {selected && (
        <motion.span
          className="absolute -inset-1.5 -z-10 rounded-full border-2 border-[#9b6bd6]/45"
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.2, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
