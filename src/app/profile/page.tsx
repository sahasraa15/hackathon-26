"use client";

import { GithubFeedback } from "@/components/rung/GithubFeedback";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  majors,
  majorsForFilter,
  professionFields,
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
    exploreMajors,
    setExploreMajors,
    proFields: proFieldIds,
    setProFields,
  } = useRung();
  const tone = ratingTone(githubRating);
  const nextProjects = projectsForRating(githubRating).slice(0, 2);
  const platinum = points >= 160;
  const [ghError, setGhError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const err = searchParams.get("gh_error");
    if (err) {
      setGhError(err);
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

  const disconnectGithub = async () => {
    await fetch("/api/github/score", { method: "DELETE" });
    clearGithubProfile();
  };

  return (
    <div className="px-5 pt-4 pb-10">
      <div className="flex items-start gap-4">
        <Avatar initials={you.avatar} role={you.role} size="xl" ring />
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
            {you.name}
          </h1>
          <p className="mt-0.5 text-sm text-rung-mute">
            @{you.handle}
            {you.major ? ` · ${you.major}` : ""}
            {you.company ? ` · ${you.company}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#ffffc5] px-2.5 py-0.5 text-[11px] font-medium text-rung-fg">
              {you.college}
            </span>
            <span className="rounded-full bg-[#f6efff] px-2.5 py-0.5 text-[11px] font-medium text-rung-fg">
              {you.affiliation === "alumni"
                ? "Alumni"
                : you.affiliation === "student"
                  ? "Student"
                  : you.affiliation}
            </span>
            <span className="rounded-full bg-[#e5ccff] px-2.5 py-0.5 text-[11px] font-medium text-rung-fg">
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
        <section className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-4">
          <p className="text-sm font-semibold text-rung-fg">Your major</p>
          <p className="mt-1 text-xs text-rung-mute">
            Feed, Reels, Match & Stories show this major plus the ones you
            explore.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {majors.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMyMajor(m)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium",
                  myMajor === m
                    ? "bg-[#e5ccff] text-rung-fg"
                    : "bg-[#fffcf0] text-rung-mute ring-1 ring-black/[0.06]",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-rung-fg">
            Also explore
          </p>
          <p className="mt-1 text-xs text-rung-mute">
            Other majors mixed into your feed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {majors
              .filter((m) => !majorsForFilter(myMajor).includes(m))
              .map((m) => {
                const on = exploreMajors.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setExploreMajors(
                        on
                          ? exploreMajors.filter((x) => x !== m)
                          : [...exploreMajors, m],
                      )
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium",
                      on
                        ? "bg-[#ffe2c5] text-rung-fg"
                        : "bg-[#fffcf0] text-rung-mute ring-1 ring-black/[0.06]",
                    )}
                  >
                    {m}
                  </button>
                );
              })}
          </div>
          <button
            type="button"
            onClick={() => setMajorOnly(!majorOnly)}
            className="mt-4 w-full rounded-full border border-black/[0.08] py-2.5 text-sm font-medium text-rung-fg"
          >
            {majorOnly ? "Showing: my picks" : "Showing: all majors"}
          </button>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href="/my-projects"
              className="text-sm font-medium text-rung-ember"
            >
              My projects →
            </Link>
            <Link
              href="/projects"
              className="text-sm font-medium text-rung-ember"
            >
              Browse projects →
            </Link>
            <Link
              href="/mentors"
              className="text-sm font-medium text-rung-ember"
            >
              Spend points on mentors →
            </Link>
          </div>
        </section>
      )}

      {session === "professional" && (
        <section className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-4">
          <p className="text-sm font-semibold text-rung-fg">Your fields</p>
          <p className="mt-1 text-xs text-rung-mute">
            Your feedback queue shows students in these fields first.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {professionFields.map((f) => {
              const on = proFieldIds.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setProFields(
                      on
                        ? proFieldIds.filter((x) => x !== f.id)
                        : [...proFieldIds, f.id],
                    )
                  }
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium",
                    on
                      ? "bg-[#ffe2c5] text-rung-fg"
                      : "bg-[#fffcf0] text-rung-mute ring-1 ring-black/[0.06]",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-rung-mute">
            Portfolio score
          </p>
          <Link href="/tiers" className="text-xs font-medium text-rung-ember">
            Tiers
          </Link>
        </div>
        <p className="mt-1 text-4xl font-semibold tabular-nums text-rung-fg">
          {syncing ? "…" : githubRating}
        </p>
        <p className="mt-0.5 text-sm text-rung-ember">{tone.label}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[#e5ccff]"
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
            <GithubFeedback scoredAt={githubProfile.scoredAt} />
            <div className="flex gap-2 pt-1">
              <a
                href="/api/auth/github?returnTo=/profile"
                className="flex-1 rounded-full bg-[#e5ccff] py-2.5 text-center text-sm font-medium text-rung-fg"
              >
                Rescore
              </a>
              <button
                type="button"
                onClick={() => void disconnectGithub()}
                className="rounded-full border border-black/[0.08] px-4 py-2.5 text-sm font-medium text-rung-mute"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <a
            href="/api/auth/github?returnTo=/profile"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#24292f] py-3 text-sm font-medium text-white"
          >
            <GithubMark />
            Connect GitHub
          </a>
        )}
        {!githubProfile && (
          <form
            action="/api/github/public"
            method="get"
            className="mt-2 flex gap-2"
          >
            <input
              name="login"
              defaultValue="sush0731"
              aria-label="GitHub username"
              placeholder="or score a public username"
              className="min-w-0 flex-1 rounded-full bg-[#fffcf0] px-3 py-2 text-sm outline-none ring-1 ring-black/[0.06]"
            />
            <button
              type="submit"
              className="rounded-full border border-black/[0.08] px-3 py-2 text-xs font-semibold text-rung-fg"
            >
              Score it
            </button>
          </form>
        )}
        {ghError && (
          <p className="mt-3 text-xs text-red-600">{ghError}</p>
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
    <div className="rounded-xl border border-black/[0.06] bg-white px-2 py-3 text-center">
      <p className="text-lg font-semibold tabular-nums text-rung-fg">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-rung-mute">
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
