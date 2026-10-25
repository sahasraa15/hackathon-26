"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, GraduationCap, Zap } from "lucide-react";
import { useRung, type SignupProfile } from "@/lib/rung-store";

/** One-tap demo personas so nobody types an email in front of judges */
const demoStudent: SignupProfile = {
  name: "Alex Kim",
  email: "alex.kim@osu.edu",
  college: "Ohio State",
  major: "Biology",
  exploreMajors: ["CSE", "Public Health"],
};

const demoPro: SignupProfile = {
  name: "Jordan Hale",
  email: "jordan.hale@google.com",
  profession: "People ops",
  company: "Google",
  proFields: ["science", "tech"],
  level: 2,
};

function resetDemo() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("cc-"))
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
  window.location.href = "/login";
}

export default function LoginChooserPage() {
  const { login } = useRung();
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-10 sm:pt-16">
      <p className="text-sm font-semibold text-rung-fg">CollegeConnectors</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-rung-fg">
        Who are you?
      </h1>

      <div className="mt-8 space-y-3">
        <Link
          href="/login/student"
          className="flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 active:bg-[#f6efff]"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-[#e5ccff]">
            <GraduationCap className="size-5 text-rung-fg" />
          </span>
          <span className="font-semibold text-rung-fg">Student</span>
        </Link>

        <Link
          href="/login/professional"
          className="flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 active:bg-[#fff4e8]"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-[#ffe2c5]">
            <Briefcase className="size-5 text-rung-fg" />
          </span>
          <span className="font-semibold text-rung-fg">Professional</span>
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-black/[0.12] p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-rung-mute">
          <Zap className="size-3.5" />
          Quick demo
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              login("student", demoStudent);
              router.push("/");
            }}
            className="rounded-full bg-[#e5ccff] py-2.5 text-xs font-semibold text-rung-fg"
          >
            Alex · student
          </button>
          <button
            type="button"
            onClick={() => {
              login("professional", demoPro);
              router.push("/pro/feedback");
            }}
            className="rounded-full bg-[#ffe2c5] py-2.5 text-xs font-semibold text-rung-fg"
          >
            Jordan · pro
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-snug text-rung-mute">
          Tip: open Alex and Jordan in two windows side by side. Feedback Jordan
          sends lands on Alex&apos;s screen live.
        </p>
      </div>

      <button
        type="button"
        onClick={resetDemo}
        className="mt-6 self-center text-[11px] text-rung-mute underline underline-offset-2 opacity-60"
      >
        Reset demo
      </button>
    </div>
  );
}
