"use client";

import Link from "next/link";
import { Briefcase, GraduationCap } from "lucide-react";

export default function LoginChooserPage() {
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
    </div>
  );
}
