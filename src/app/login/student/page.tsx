"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check, GraduationCap } from "lucide-react";
import {
  collegeFromEmail,
  colleges,
  isEduEmail,
  majors,
  majorsForFilter,
  workCountForMajors,
} from "@/lib/rung-data";
import { useRung, type SignupProfile } from "@/lib/rung-store";
import { findAccount, saveAccount } from "@/lib/accounts";
import { AuthForm } from "@/components/rung/AuthForm";
import { Celebration, StepDots, StepPanel } from "@/components/rung/Onboarding";
import { cn } from "@/lib/utils";

const steps = ["auth", "major", "explore", "done"] as const;
type Step = (typeof steps)[number];

const WELCOME_BONUS = 10;

function Chip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium",
        active ? "bg-[#e5ccff] text-rung-fg" : "bg-[#fffcf0] text-rung-mute",
      )}
    >
      {active && <Check className="size-3" />}
      {children}
      {count !== undefined && (
        <span className="tabular-nums opacity-60">· {count}</span>
      )}
    </button>
  );
}

export default function StudentLoginPage() {
  const { login } = useRung();
  const router = useRouter();
  const [step, setStep] = useState<Step>("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState<string | null>(null);
  const [collegeDetected, setCollegeDetected] = useState(false);
  const [major, setMajor] = useState<string | null>(null);
  const [explore, setExplore] = useState<string[]>([]);

  const ownFamily = major ? majorsForFilter(major) : [];
  const exploreOptions = majors.filter((m) => !ownFamily.includes(m));
  const feedCount = workCountForMajors([...ownFamily, ...explore]);

  function enterApp(then: () => void) {
    if (!college || !major) return;
    const profile: SignupProfile = {
      name,
      email,
      college,
      major,
      exploreMajors: explore,
    };
    saveAccount("student", profile);
    login("student", profile, WELCOME_BONUS);
    then();
  }

  const back: Partial<Record<Step, Step>> = {
    major: "auth",
    explore: "major",
    done: "explore",
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-10 sm:pt-16">
      <div className="flex items-center justify-between">
        {step === "auth" ? (
          <Link href="/login" className="text-sm text-rung-mute">
            ← Back
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep(back[step]!)}
            className="text-sm text-rung-mute"
          >
            ← Back
          </button>
        )}
        {step !== "done" && (
          <StepDots step={steps.indexOf(step)} total={3} />
        )}
      </div>

      <AnimatePresence mode="wait">
        <StepPanel key={step}>
          {step === "auth" && (
            <>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg">
                Student
              </h1>
              <p className="mt-2 text-sm text-rung-mute">
                Use your school email so we can find your college.
              </p>
              <AuthForm
                emailLabel="Student email"
                emailPlaceholder="you@school.edu"
                validateEmail={(e) =>
                  isEduEmail(e) ? null : "Use your school email (ends in .edu)."
                }
                onSignUp={(n, e) => {
                  const found = collegeFromEmail(e);
                  setName(n);
                  setEmail(e);
                  setCollege(found);
                  setCollegeDetected(Boolean(found));
                  setStep("major");
                }}
                onLogIn={(e) => {
                  const saved = findAccount(e, "student");
                  if (!saved)
                    return "No student account for that email. Sign up instead.";
                  login("student", saved);
                  router.push("/");
                  return null;
                }}
              />
            </>
          )}

          {step === "major" && (
            <>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg">
                Hi {name.split(" ")[0]}
              </h1>

              <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-5">
                {collegeDetected && college ? (
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-[#e5ccff]">
                      <GraduationCap className="size-5 text-rung-fg" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-rung-mute">Your college</p>
                      <p className="font-semibold text-rung-fg">{college}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCollegeDetected(false)}
                      className="text-xs font-medium text-rung-ember"
                    >
                      Not right?
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-medium text-rung-mute">
                      We couldn&apos;t match {email.split("@")[1]}. Pick your
                      college
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {colleges.map((c) => (
                        <Chip
                          key={c}
                          active={college === c}
                          onClick={() => setCollege(c)}
                        >
                          {c}
                        </Chip>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3 space-y-3 rounded-2xl border border-black/[0.06] bg-white p-5">
                <p className="text-xs font-medium text-rung-mute">Your major</p>
                <div className="flex flex-wrap gap-2">
                  {majors.map((m) => (
                    <Chip
                      key={m}
                      active={major === m}
                      onClick={() => setMajor(m)}
                      count={workCountForMajors([m])}
                    >
                      {m}
                    </Chip>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!college || !major}
                  onClick={() => {
                    setExplore((prev) =>
                      prev.filter((m) => !majorsForFilter(major!).includes(m)),
                    );
                    setStep("explore");
                  }}
                  className="mt-2 w-full rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === "explore" && (
            <>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg">
                Explore other majors
              </h1>
              <p className="mt-2 text-sm text-rung-mute">
                You&apos;ll see {major} work, plus anything you pick here.
              </p>

              <div className="mt-6 space-y-3 rounded-2xl border border-black/[0.06] bg-white p-5">
                <div className="flex flex-wrap gap-2">
                  {exploreOptions.map((m) => (
                    <Chip
                      key={m}
                      active={explore.includes(m)}
                      count={workCountForMajors([m])}
                      onClick={() =>
                        setExplore((prev) =>
                          prev.includes(m)
                            ? prev.filter((x) => x !== m)
                            : [...prev, m],
                        )
                      }
                    >
                      {m}
                    </Chip>
                  ))}
                </div>
                <p className="text-xs text-rung-mute">
                  Your feed: <span className="font-semibold text-rung-fg tabular-nums">{feedCount}</span>{" "}
                  posts to start
                </p>
                <button
                  type="button"
                  onClick={() => setStep("done")}
                  className="w-full rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg"
                >
                  {explore.length
                    ? `Continue with ${explore.length} more`
                    : "Continue"}
                </button>
                {explore.length === 0 && (
                  <p className="text-center text-[11px] text-rung-mute">
                    Or skip — you can add majors later in Profile.
                  </p>
                )}
              </div>
            </>
          )}

          {step === "done" && (
            <Celebration
              title={`You're in, ${name.split(" ")[0]}!`}
              points={WELCOME_BONUS}
            >
              <p className="text-sm text-rung-mute">
                {college} · {major}
                {explore.length > 0 && ` + ${explore.join(", ")}`}
              </p>
              <button
                type="button"
                onClick={() =>
                  enterApp(() =>
                    // Let the store persist the new session before leaving the app
                    setTimeout(() => {
                      window.location.href = "/api/auth/github?returnTo=/profile";
                    }, 80),
                  )
                }
                className="mt-4 w-full rounded-full bg-[#24292f] py-3 text-sm font-semibold text-white"
              >
                Connect GitHub · boost your score
              </button>
              <button
                type="button"
                onClick={() => enterApp(() => router.push("/"))}
                className="w-full rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg"
              >
                Start exploring
              </button>
            </Celebration>
          )}
        </StepPanel>
      </AnimatePresence>
    </div>
  );
}
