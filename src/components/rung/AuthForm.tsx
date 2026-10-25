"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Mode = "signup" | "login";

const inputClass =
  "w-full rounded-xl bg-[#fffcf0] px-3 py-2.5 text-sm text-rung-fg outline-none ring-1 ring-black/[0.06] focus:ring-[#c9a6ff]";

export function AuthForm({
  emailLabel,
  emailPlaceholder,
  validateEmail,
  onSignUp,
  onLogIn,
}: {
  emailLabel: string;
  emailPlaceholder: string;
  /** Returns an error message, or null when the email is acceptable */
  validateEmail: (email: string) => string | null;
  onSignUp: (name: string, email: string) => void;
  /** Returns an error message when no account matches */
  onLogIn: (email: string) => string | null;
}) {
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !name.trim()) {
      setError("Add your name.");
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setError(null);
    if (mode === "signup") onSignUp(name.trim(), email.trim());
    else setError(onLogIn(email.trim()));
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 space-y-3 rounded-2xl border border-black/[0.06] bg-white p-5"
    >
      <div className="grid grid-cols-2 rounded-full bg-[#fffcf0] p-1 ring-1 ring-black/[0.06]">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              "rounded-full py-2 text-xs font-semibold",
              mode === m ? "bg-[#e5ccff] text-rung-fg" : "text-rung-mute",
            )}
          >
            {m === "signup" ? "Sign up" : "Log in"}
          </button>
        ))}
      </div>

      {mode === "signup" && (
        <label className="block">
          <span className="text-xs font-medium text-rung-mute">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="First Last"
            className={cn(inputClass, "mt-1")}
          />
        </label>
      )}

      <label className="block">
        <span className="text-xs font-medium text-rung-mute">{emailLabel}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder={emailPlaceholder}
          className={cn(inputClass, "mt-1")}
        />
      </label>

      {error && <p className="text-xs font-medium text-[#b42318]">{error}</p>}

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg"
      >
        {mode === "signup" ? "Continue" : "Log in"}
      </button>
    </form>
  );
}
