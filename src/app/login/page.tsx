"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRung } from "@/lib/rung-store";

export default function LoginPage() {
  const { login } = useRung();
  const router = useRouter();

  return (
    <div className="app-sunset relative flex min-h-full flex-col overflow-hidden px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))] sm:pt-14">
      <div className="pointer-events-none absolute -right-10 top-20 size-40 rounded-full bg-[#e4c4ff]/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 bottom-32 size-44 rounded-full bg-[#fff59a]/70 blur-3xl" />

      <Link
        href="/"
        className="relative z-10 text-sm font-bold text-rung-mute"
      >
        ← Back
      </Link>

      <motion.h1
        className="relative z-10 mt-8 font-display text-4xl font-extrabold tracking-tight text-rung-fg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Jump back in
      </motion.h1>
      <p className="relative z-10 mt-2 text-sm font-semibold text-rung-mute">
        Demo mode — pick a vibe. New?{" "}
        <Link href="/signup" className="text-rung-ember underline-offset-2 hover:underline">
          Sign up
        </Link>
      </p>

      <div className="relative z-10 mt-10 space-y-4">
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => {
            login("student");
            router.push("/");
          }}
          className="w-full overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#fff59a] via-[#f0e0ff] to-[#e4c4ff] p-[2px] text-left shadow-[0_14px_36px_rgba(155,107,214,0.22)] active:scale-[0.98]"
        >
          <div className="rounded-[1.5rem] bg-white/55 p-5 backdrop-blur-md">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-rung-ember">
              Student
            </p>
            <p className="mt-1 font-display text-xl font-bold text-rung-fg">
              Alex · builder mode
            </p>
            <p className="mt-1 text-sm font-semibold text-rung-mute">
              Feed, reels, match, portfolio score
            </p>
          </div>
        </motion.button>

        <motion.button
          type="button"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18 }}
          onClick={() => {
            login("professional");
            router.push("/pro");
          }}
          className="w-full overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#e4c4ff] via-[#f0e0ff] to-[#fff59a] p-[2px] text-left shadow-[0_14px_36px_rgba(155,107,214,0.22)] active:scale-[0.98]"
        >
          <div className="rounded-[1.5rem] bg-white/55 p-5 backdrop-blur-md">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b6bd6]">
              Mentor
            </p>
            <p className="mt-1 font-display text-xl font-bold text-rung-fg">
              Jordan · industry
            </p>
            <p className="mt-1 text-sm font-semibold text-rung-mute">
              Feedback mins, mentees, sponsor briefs
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
