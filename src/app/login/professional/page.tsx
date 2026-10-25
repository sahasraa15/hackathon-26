"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import {
  demoAuthor,
  majorsForFields,
  levels,
  professionFields,
  workCountForMajors,
} from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { findAccount, saveAccount } from "@/lib/accounts";
import { AuthForm } from "@/components/rung/AuthForm";
import { Avatar } from "@/components/rung/Avatar";
import { StepDots, StepPanel } from "@/components/rung/Onboarding";
import { cn } from "@/lib/utils";

const steps = ["auth", "field", "preview"] as const;
type Step = (typeof steps)[number];

const personalDomains = [
  "gmail",
  "yahoo",
  "outlook",
  "hotmail",
  "icloud",
  "aol",
  "proton",
];

function companyFromEmail(email: string) {
  const label = email.split("@")[1]?.split(".")[0] ?? "";
  if (!label || personalDomains.includes(label.toLowerCase())) return undefined;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function ProfessionalLoginPage() {
  const { login, demos } = useRung();
  const router = useRouter();
  const [step, setStep] = useState<Step>("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [level, setLevel] = useState<number | null>(null);

  const fieldMajors = majorsForFields(fields);
  const fieldDemos = demos.filter((d) =>
    fieldMajors.includes(demoAuthor(d).major ?? ""),
  );

  function finish() {
    const profile = {
      name,
      email,
      profession: profession.trim(),
      company: companyFromEmail(email),
      proFields: fields,
      level: level ?? 2,
    };
    saveAccount("professional", profile);
    login("professional", profile);
    router.push("/pro");
  }

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
            onClick={() => setStep(step === "preview" ? "field" : "auth")}
            className="text-sm text-rung-mute"
          >
            ← Back
          </button>
        )}
        <StepDots step={steps.indexOf(step)} total={steps.length} />
      </div>

      <AnimatePresence mode="wait">
        <StepPanel key={step}>
          {step === "auth" && (
            <>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg">
                Professional
              </h1>
              <p className="mt-2 text-sm text-rung-mute">
                Give feedback to students in your field.
              </p>
              <AuthForm
                emailLabel="Work email"
                emailPlaceholder="you@company.com"
                validateEmail={(e) =>
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
                    ? null
                    : "Enter a valid email."
                }
                onSignUp={(n, e) => {
                  setName(n);
                  setEmail(e);
                  setStep("field");
                }}
                onLogIn={(e) => {
                  const saved = findAccount(e, "professional");
                  if (!saved)
                    return "No professional account for that email. Sign up instead.";
                  login("professional", saved);
                  router.push("/pro");
                  return null;
                }}
              />
            </>
          )}

          {step === "field" && (
            <>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg">
                What do you do, {name.split(" ")[0]}?
              </h1>

              <div className="mt-6 space-y-4 rounded-2xl border border-black/[0.06] bg-white p-5">
                <label className="block">
                  <span className="text-xs font-medium text-rung-mute">
                    Your profession
                  </span>
                  <input
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Software engineer, Nurse practitioner"
                    className="mt-1 w-full rounded-xl bg-[#fffcf0] px-3 py-2.5 text-sm text-rung-fg outline-none ring-1 ring-black/[0.06] focus:ring-[#c9a6ff]"
                  />
                </label>

                <div>
                  <p className="text-xs font-medium text-rung-mute">
                    Your field of expertise (pick any)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {professionFields.map((f) => {
                      const active = fields.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            setFields((prev) =>
                              active
                                ? prev.filter((x) => x !== f.id)
                                : [...prev, f.id],
                            )
                          }
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium",
                            active
                              ? "bg-[#ffe2c5] text-rung-fg"
                              : "bg-[#fffcf0] text-rung-mute",
                          )}
                        >
                          {active && <Check className="size-3" />}
                          {f.label}
                          <span className="tabular-nums opacity-60">
                            · {workCountForMajors(f.majors)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-rung-mute">
                    Where are you in your career?
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {levels.map((l) => (
                      <button
                        key={l.id}

                        type="button"

                        aria-pressed={level === l.id}

                        onClick={() => setLevel(l.id)}

                        className={cn(
                          "rounded-xl px-3 py-2 text-xs font-medium",

                          level === l.id
                            ? "bg-[#e5ccff] text-rung-fg"
                            : "bg-[#fffcf0] text-rung-mute",
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  <p className="mt-1.5 text-[11px] text-rung-mute">
                    Sets your rung on the Ladder: who you learn from and who you
                    help.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!profession.trim() || fields.length === 0 || !level}
                  onClick={() => setStep("preview")}
                  className="w-full rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === "preview" && (
            <>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg">
                Students in your field
              </h1>
              <p className="mt-2 text-sm text-rung-mute">
                {fieldDemos.length} demos · {fieldMajors.join(" · ")}
              </p>

              <ul className="mt-6 max-h-[22rem] space-y-2 overflow-y-auto">
                {fieldDemos.length === 0 && (
                  <li className="rounded-2xl border border-black/[0.06] bg-white p-4 text-sm text-rung-mute">
                    No student work in these fields yet. You&apos;ll see it here
                    as it&apos;s posted.
                  </li>
                )}
                {fieldDemos.map((d) => {
                  const author = demoAuthor(d);
                  return (
                    <li
                      key={d.id}
                      className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4"
                    >
                      <Avatar initials={author.avatar} role={author.role} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-rung-fg">
                          {d.title}
                        </p>
                        <p className="text-xs text-rung-mute">
                          {author.name} · {author.major} · {author.college}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={finish}
                className="mt-4 w-full rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg"
              >
                Start giving feedback
              </button>
            </>
          )}
        </StepPanel>
      </AnimatePresence>
    </div>
  );
}
