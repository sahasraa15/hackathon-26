"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  majors,
  projectsForRating,
  ratingTone,
  sponsorProjects,
} from "@/lib/rung-data";
import { useRung, type GithubProfile } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="px-5 pt-4 text-sm text-rung-mute">…</div>}>
      <ProfileInner />
    </Suspense>
  );
}

function ProfileInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    you,
    points,
    githubRating,
    githubProfile,
    tier,
    joinedSponsors,
    matched,
    bookings,
    session,
    logout,
    feedbackMinsToday,
    feedbackGoalMins,
    myMajor,
    setMyMajor,
    majorOnly,
    setMajorOnly,
    applyGithubScore,
    clearGithubProfile,
  } = useRung();
  const tone = ratingTone(githubRating);
  const nextProjects = projectsForRating(githubRating).slice(0, 2);
  const platinum = points >= 160;
  const [ghError, setGhError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [ghLogin, setGhLogin] = useState("sahasraa15");

  useEffect(() => {
    const err = searchParams.get("gh_error");
    if (err) {
      setGhError(
        err === "oauth_not_configured"
          ? "OAuth isn’t set up yet — enter your username below to score public repos."
          : err,
      );
      router.replace("/profile", { scroll: false });
      return;
    }
    if (searchParams.get("gh") !== "connected") return;

    setSyncing(true);
    void (async () => {
      try {
        const res = await fetch("/api/github/score");
        if (!res.ok) throw new Error("Could not load GitHub score");
        const data = (await res.json()) as GithubProfile;
        applyGithubScore(data);
      } catch (e) {
        setGhError(e instanceof Error ? e.message : "GitHub sync failed");
      } finally {
        setSyncing(false);
        router.replace("/profile", { scroll: false });
      }
    })();
  }, [searchParams, applyGithubScore, router]);

  const scorePublicGithub = async (overrideLogin?: string) => {
    const login = (overrideLogin ?? ghLogin).trim().replace(/^@/, "");
    if (!login) {
      setGhError("Enter a GitHub username");
      return;
    }
    setSyncing(true);
    setGhError(null);
    try {
      const res = await fetch("/api/github/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = (await res.json()) as GithubProfile & { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not score GitHub");
      applyGithubScore(data);
      setGhLogin(data.login);
    } catch (e) {
      setGhError(e instanceof Error ? e.message : "GitHub score failed");
    } finally {
      setSyncing(false);
    }
  };

  const disconnectGithub = async () => {
    await fetch("/api/github/score", { method: "DELETE" });
    clearGithubProfile();
  };

  return (
    <div className="px-5 pt-4 pb-10">
      <div className="cc-panel flex items-start gap-4 p-4">
        <Avatar initials={you.avatar} role={you.role} size="xl" ring />
        <div className="min-w-0 flex-1 pt-1">
          <p className="cc-eyebrow">Your profile</p>
          <h1 className="cc-title mt-1 text-xl">{you.name}</h1>
          <p className="mt-0.5 text-sm font-semibold text-rung-mute">
            @{you.handle}
            {you.major ? ` · ${you.major}` : ""}
            {you.company ? ` · ${you.company}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#fff59a] px-2.5 py-0.5 text-[11px] font-extrabold text-rung-fg">
              {you.college}
            </span>
            <span className="rounded-full bg-[#f0e0ff] px-2.5 py-0.5 text-[11px] font-extrabold text-rung-fg">
              {you.affiliation === "alumni"
                ? "Alumni"
                : you.affiliation === "student"
                  ? "Student"
                  : you.affiliation}
            </span>
            <span className="rounded-full bg-[#e4c4ff] px-2.5 py-0.5 text-[11px] font-extrabold text-rung-fg">
              {tier.name}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {session === "student" ? (
          <>
            <Stat label="Points" value={String(points)} />
            <Stat label="Matches" value={String(matched.length)} />
            <Stat label="Bookings" value={String(bookings.length)} />
          </>
        ) : (
          <>
            <Stat label="FB min" value={String(feedbackMinsToday)} />
            <Stat label="Goal" value={String(feedbackGoalMins)} />
            <Stat label="Connects" value={String(matched.length)} />
          </>
        )}
      </div>

      {session === "student" && (
        <section className="cc-panel mt-6 p-4">
          <p className="cc-eyebrow">Quick major</p>
          <p className="mt-1 text-xs font-semibold text-rung-mute">
            Full controls (college, filter, GitHub) live in Settings.
          </p>
          <Link
            href="/settings"
            className="mt-2 inline-block text-sm font-extrabold text-rung-ember"
          >
            Open Settings →
          </Link>
          <div className="mt-3 flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={() => setMajorOnly(!majorOnly)}
            className="mt-4 w-full rounded-full bg-[#2c1f3a] py-2.5 text-sm font-extrabold text-[#fff59a]"
          >
            {majorOnly ? "Showing: my major" : "Showing: all majors"}
          </button>
          <Link
            href="/projects"
            className="mt-3 inline-block text-sm font-medium text-rung-ember"
          >
            Browse projects →
          </Link>
        </section>
      )}

      <section className="cc-panel mt-6 p-4">
        <div className="flex items-center justify-between">
          <p className="cc-eyebrow">Portfolio score</p>
          <Link href="/tiers" className="text-xs font-extrabold text-rung-ember">
            Tiers
          </Link>
        </div>
        <p className="cc-title mt-1 text-4xl tabular-nums">
          {syncing ? "…" : githubRating}
        </p>
        <p className="mt-0.5 text-sm font-bold text-rung-ember">{tone.label}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2c1f3a]/08">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#fff59a] to-[#e4c4ff]"
            style={{ width: `${githubRating}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-rung-mute">{tone.tip}</p>

        {githubProfile ? (
          <div className="mt-4 space-y-2 border-t border-black/[0.06] pt-4">
            <p className="text-sm font-medium text-rung-fg">
              @{githubProfile.login}
              <span className="ml-2 text-xs font-normal text-rung-mute">
                {githubProfile.originalCount} original ·{" "}
                {githubProfile.repoCount} repos
              </span>
            </p>
            {githubProfile.languages.length > 0 && (
              <p className="text-xs text-rung-mute">
                {githubProfile.languages.join(" · ")}
              </p>
            )}
            {githubProfile.highlights.length > 0 && (
              <ul className="space-y-1">
                {githubProfile.highlights.map((h) => (
                  <li key={h} className="text-xs text-rung-fg">
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => void scorePublicGithub(githubProfile.login)}
                disabled={syncing}
                className="flex-1 rounded-full bg-gradient-to-r from-[#fff59a] to-[#e4c4ff] py-2.5 text-center text-sm font-extrabold text-rung-fg disabled:opacity-50"
              >
                {syncing ? "Scoring…" : "Rescore"}
              </button>
              <button
                type="button"
                onClick={() => void disconnectGithub()}
                className="rounded-full bg-white/70 px-4 py-2.5 text-sm font-bold text-rung-mute ring-1 ring-[#2c1f3a]/08"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <label className="block text-xs font-extrabold text-rung-mute">
              GitHub username
            </label>
            <div className="flex gap-2">
              <input
                value={ghLogin}
                onChange={(e) => setGhLogin(e.target.value)}
                placeholder="sahasraa15"
                className="min-w-0 flex-1 rounded-full bg-white/80 px-4 py-2.5 text-sm font-semibold text-rung-fg outline-none ring-1 ring-[#2c1f3a]/08 focus:ring-[#9b6bd6]/45"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => void scorePublicGithub()}
                disabled={syncing}
                className="shrink-0 rounded-full bg-[#24292f] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
              >
                {syncing ? "…" : "Score"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => void scorePublicGithub()}
              disabled={syncing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#24292f] py-3 text-sm font-extrabold text-white disabled:opacity-50"
            >
              <GithubMark />
              {syncing ? "Scoring repos…" : "Connect GitHub"}
            </button>
            <p className="text-[11px] font-semibold text-rung-mute">
              Scores public repos (no OAuth needed for the demo).
            </p>
          </div>
        )}
        {ghError && (
          <p className="mt-3 text-xs font-semibold text-red-600">{ghError}</p>
        )}
      </section>

      {session === "student" && (
        <>
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-rung-fg">
              Suggested for you
            </h2>
            <ul className="mt-3 space-y-2">
              {nextProjects.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-black/[0.06] bg-white px-4 py-3"
                >
                  <p className="text-sm font-medium text-rung-fg">{p.title}</p>
                  <p className="text-xs text-rung-mute">
                    Diff {p.difficulty}/5 · +{p.pointsOnComplete} pts
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {platinum && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-rung-fg">
                Platinum sponsors unlocked
              </h2>
              <ul className="mt-3 space-y-2">
                {sponsorProjects.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl border border-black/[0.06] bg-white px-4 py-3"
                  >
                    <p className="text-xs text-rung-ember">{s.company}</p>
                    <p className="text-sm font-medium text-rung-fg">{s.title}</p>
                    {joinedSponsors.includes(s.id) && (
                      <p className="text-xs text-rung-mute">Joined</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="mt-10 w-full rounded-full border border-black/[0.08] py-3 text-sm font-medium text-rung-mute"
      >
        Log out
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="cc-panel px-2 py-3 text-center">
      <p className="cc-title text-lg tabular-nums">{value}</p>
      <p className="cc-eyebrow mt-0.5 normal-case tracking-[0.08em]">
        {label}
      </p>
    </div>
  );
}

function GithubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.62 7.62 0 018 4.42c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
