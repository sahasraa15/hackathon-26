"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { majors } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { cn } from "@/lib/utils";

export default function StudentLoginPage() {
  const { login, setMyMajor } = useRung();
  const router = useRouter();
  const [major, setMajor] = useState("Biology");

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-10 sm:pt-16">
      <Link href="/login" className="text-sm text-rung-mute">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg">
        Student login
      </h1>
      <p className="mt-2 text-sm text-rung-mute">Alex Kim · Ohio State</p>

      <div className="mt-8 space-y-3 rounded-2xl border border-black/[0.06] bg-white p-5">
        <label className="block text-xs font-medium text-rung-mute">
          Your major
        </label>
        <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
          {majors.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMajor(m)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium",
                major === m
                  ? "bg-[#e5ccff] text-rung-fg"
                  : "bg-[#fffcf0] text-rung-mute",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <input
          readOnly
          value="alex.kim@osu.edu"
          className="mt-2 w-full rounded-xl bg-[#fffcf0] px-3 py-2.5 text-sm outline-none ring-1 ring-black/[0.06]"
        />
        <button
          type="button"
          onClick={() => {
            login("student");
            setMyMajor(major);
            router.push("/");
          }}
          className="mt-2 w-full rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
