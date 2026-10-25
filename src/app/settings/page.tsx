"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { colleges, majors } from "@/lib/rung-data";
import { useRung, type ContentScope } from "@/lib/rung-store";
import { cn } from "@/lib/utils";

const SCOPE_OPTS: {
  id: ContentScope;
  title: string;
  blurb: string;
}[] = [
  { id: "major", title: "My major only", blurb: "Quiet feed — same field as you." },
  { id: "campus", title: "My campus", blurb: "Everyone at your college." },
  { id: "all", title: "Everything", blurb: "All majors & campuses." },
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    you,
    myMajor,
    setMyMajor,
    myCollege,
    setMyCollege,
    contentScope,
    setContentScope,
    year,
    goals,
    githubProfile,
    logout,
    setTutorialDone,
  } = useRung();

  return (
    <div className="px-5 pb-10 pt-4">
      <div className="cc-panel p-4">
        <p className="cc-eyebrow">Preferences</p>
        <h1 className="cc-title mt-1 text-2xl">Settings</h1>
        <p className="mt-1 text-sm font-semibold text-rung-mute">
          Change these anytime — nothing is permanent.
        </p>
      </div>

      <section className="cc-panel mt-4 p-4">
        <p className="cc-eyebrow">Profile</p>
        <p className="mt-2 text-sm font-extrabold text-rung-fg">{you.name}</p>
        <p className="text-xs font-semibold text-rung-mute">
          {year} · {myCollege} · {myMajor}
        </p>
        {goals.length > 0 && (
          <p className="mt-2 text-xs font-semibold text-rung-mute">
            Goals: {goals.join(", ")}
          </p>
        )}
      </section>

      <section className="cc-panel mt-4 p-4">
        <p className="text-sm font-extrabold text-rung-fg">What I see</p>
        <p className="mt-1 text-xs font-semibold text-rung-mute">
          Controls Feed, Reels, Match &amp; Stories.
        </p>
        <div className="mt-3 space-y-2">
          {SCOPE_OPTS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setContentScope(o.id)}
              className={cn(
                "w-full rounded-xl px-3 py-2.5 text-left ring-1 transition",
                contentScope === o.id
                  ? "bg-gradient-to-r from-[#fff59a]/80 to-[#e4c4ff]/80 ring-[#9b6bd6]/35"
                  : "bg-white/60 ring-[#2c1f3a]/06",
              )}
            >
              <p className="text-sm font-extrabold text-rung-fg">{o.title}</p>
              <p className="text-[11px] font-semibold text-rung-mute">{o.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="cc-panel mt-4 p-4">
        <p className="text-sm font-extrabold text-rung-fg">College</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colleges.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setMyCollege(c)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-extrabold",
                myCollege === c
                  ? "bg-gradient-to-r from-[#fff59a] to-[#e4c4ff] text-rung-fg"
                  : "bg-white/70 text-rung-mute ring-1 ring-[#2c1f3a]/08",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="cc-panel mt-4 p-4">
        <p className="text-sm font-extrabold text-rung-fg">Major</p>
        <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
          {majors.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMyMajor(m)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-extrabold",
                myMajor === m
                  ? "bg-gradient-to-r from-[#fff59a] to-[#e4c4ff] text-rung-fg"
                  : "bg-white/70 text-rung-mute ring-1 ring-[#2c1f3a]/08",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      <section className="cc-panel mt-4 p-4">
        <p className="text-sm font-extrabold text-rung-fg">GitHub</p>
        <p className="mt-1 text-xs font-semibold text-rung-mute">
          {githubProfile
            ? `Connected as @${githubProfile.login}`
            : "Not connected — score public repos on Profile."}
        </p>
        <Link
          href="/profile"
          className="mt-3 inline-flex rounded-full bg-[#fff59a] px-4 py-2 text-xs font-extrabold text-rung-fg"
        >
          {githubProfile ? "Open profile / rescore" : "Connect on Profile"}
        </Link>
      </section>

      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={() => {
            setTutorialDone(false);
            router.push("/");
          }}
          className="w-full rounded-full bg-white/80 py-3 text-sm font-extrabold text-rung-fg ring-1 ring-[#2c1f3a]/08"
        >
          Replay beginner tutorial
        </button>
        <Link
          href="/profile"
          className="block w-full rounded-full bg-white/80 py-3 text-center text-sm font-extrabold text-rung-fg ring-1 ring-[#2c1f3a]/08"
        >
          Open profile
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full rounded-full py-3 text-sm font-bold text-rung-mute"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
