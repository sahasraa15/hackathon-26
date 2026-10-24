"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRung } from "@/lib/rung-store";

export default function ProfessionalLoginPage() {
  const { login } = useRung();
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-10 sm:pt-16">
      <Link href="/login" className="text-sm text-rung-mute">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-rung-fg">
        Professional
      </h1>
      <p className="mt-2 text-sm text-rung-mute">Jordan Hale · Google</p>

      <div className="mt-8 space-y-3 rounded-2xl border border-black/[0.06] bg-white p-5">
        <input
          readOnly
          value="jordan.hale@google.com"
          className="w-full rounded-xl bg-[#fffcf0] px-3 py-2.5 text-sm outline-none ring-1 ring-black/[0.06]"
        />
        <button
          type="button"
          onClick={() => {
            login("professional");
            router.push("/pro");
          }}
          className="w-full rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
