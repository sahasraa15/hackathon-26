"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { colleges, majors } from "@/lib/rung-data";
import {
  useRung,
  type ContentScope,
  type SignupProfile,
} from "@/lib/rung-store";
import { cn } from "@/lib/utils";

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Grad"];
const GOAL_OPTS = [
  "Find a project partner",
  "Get mentor feedback",
  "Show my portfolio",
  "Join research",
  "Prep for internships",
  "Meet people in my major",
];

const STEPS = [
  "About you",
  "Campus",
  "Major",
  "Goals",
  "GitHub",
  "Feed prefs",
] as const;

export default function SignupPage() {
  const { completeSignup } = useRung();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState<(typeof colleges)[number]>("Ohio State");
  const [major, setMajor] = useState<(typeof majors)[number]>("CSE");
  const [year, setYear] = useState("1st year");
  const [goals, setGoals] = useState<string[]>([]);
  const [connectGithub, setConnectGithub] = useState(false);
  const [contentScope, setContentScope] = useState<ContentScope>("major");

  const canNext = useMemo(() => {
    if (step === 0) return displayName.trim().length > 1 && email.includes("@");
    if (step === 3) return goals.length > 0;
    return true;
  }, [step, displayName, email, goals]);

  const finish = () => {
    const profile: SignupProfile = {
      displayName: displayName.trim(),
      email: email.trim(),
      college,
      major,
      year,
      goals,
      contentScope,
      connectGithub,
    };
    completeSignup(profile);
    if (connectGithub) {
      window.location.href = "/api/auth/github?returnTo=/";
      return;
    }
    router.push("/");
  };

  const next = () => {
    if (step >= STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  };

  return (
    <div className="app-sunset relative flex min-h-full flex-col overflow-hidden px-5 pb-8 pt-[max(2.75rem,env(safe-area-inset-top))] sm:pt-14">
      <div className="pointer-events-none absolute -right-8 top-24 size-36 rounded-full bg-[#e4c4ff]/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-20 size-40 rounded-full bg-[#fff59a]/60 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="text-sm font-bold text-rung-mute">
          ← Home
        </Link>
        <p className="rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-extrabold text-rung-ember">
          {step + 1}/{STEPS.length}
        </p>
      </div>

      <div className="relative z-10 mt-4 flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={STEPS[i]}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= step
                ? "bg-gradient-to-r from-[#fff59a] to-[#e4c4ff]"
                : "bg-black/[0.06]",
            )}
          />
        ))}
      </div>

      <h1 className="relative z-10 mt-6 font-display text-3xl font-extrabold tracking-tight text-rung-fg">
        {STEPS[step]}
      </h1>

      <div className="relative z-10 mt-5 flex-1">
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-rung-mute">
              We&apos;ll use this on your profile. Demo only — nothing is emailed.
            </p>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-sm outline-none"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="school email"
              inputMode="email"
              className="w-full rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-sm outline-none"
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm text-rung-mute">Which campus are you on?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {colleges.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCollege(c)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium",
                    college === c
                      ? "bg-[#e5ccff] text-rung-fg"
                      : "bg-white text-rung-mute ring-1 ring-black/[0.06]",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-rung-mute">Major</p>
              <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                {majors.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMajor(m)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium",
                      major === m
                        ? "bg-[#ffffc5] text-rung-fg ring-1 ring-[#e5ccff]"
                        : "bg-white text-rung-mute ring-1 ring-black/[0.06]",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-rung-mute">Year</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium",
                      year === y
                        ? "bg-[#f0e0ff] text-rung-fg"
                        : "bg-white text-rung-mute ring-1 ring-black/[0.06]",
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm text-rung-mute">What do you want help with? (pick any)</p>
            <div className="mt-3 space-y-2">
              {GOAL_OPTS.map((g) => {
                const on = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setGoals((prev) =>
                        on ? prev.filter((x) => x !== g) : [...prev, g],
                      )
                    }
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium",
                      on
                        ? "border-[#e5ccff] bg-[#f6efff] text-rung-fg"
                        : "border-black/[0.06] bg-white text-rung-mute",
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-rung-mute">
              Optional — connect GitHub so we can score your repos by complexity.
              You can skip and add it later in Settings.
            </p>
            <button
              type="button"
              onClick={() => setConnectGithub(true)}
              className={cn(
                "w-full rounded-2xl py-3.5 text-sm font-semibold",
                connectGithub
                  ? "bg-rung-fg text-white"
                  : "bg-white text-rung-fg ring-1 ring-black/[0.08]",
              )}
            >
              {connectGithub ? "GitHub selected ✓" : "Connect GitHub"}
            </button>
            <button
              type="button"
              onClick={() => setConnectGithub(false)}
              className="w-full text-sm text-rung-mute"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <p className="text-sm text-rung-mute">
              What should your Feed &amp; Reels show first?
            </p>
            {(
              [
                {
                  id: "major" as const,
                  title: "My major only",
                  blurb: `Just ${major} — quieter feed.`,
                },
                {
                  id: "campus" as const,
                  title: "My whole campus",
                  blurb: `Everyone at ${college}.`,
                },
                {
                  id: "all" as const,
                  title: "Everything",
                  blurb: "All majors & campuses.",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setContentScope(opt.id)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3.5 text-left",
                  contentScope === opt.id
                    ? "border-[#e5ccff] bg-[#f6efff]"
                    : "border-black/[0.06] bg-white",
                )}
              >
                <p className="text-sm font-semibold text-rung-fg">{opt.title}</p>
                <p className="mt-0.5 text-xs text-rung-mute">{opt.blurb}</p>
              </button>
            ))}
            <p className="pt-2 text-xs leading-relaxed text-rung-mute">
              You can change this anytime in <span className="font-semibold text-rung-fg">Settings</span>.
            </p>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-6 flex gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-full border border-black/[0.08] bg-white/80 px-5 py-3.5 text-sm font-extrabold text-rung-mute"
          >
            Back
          </button>
        )}
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="flex-1 rounded-full bg-rung-fg py-3.5 text-sm font-extrabold text-[#fff59a] shadow-[0_10px_24px_rgba(44,31,58,0.22)] disabled:opacity-40"
        >
          {step === STEPS.length - 1 ? "Let’s go →" : "Continue"}
        </button>
      </div>
    </div>
  );
}
