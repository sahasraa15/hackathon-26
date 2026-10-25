import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { scoreGithubRepos, type GhRepo } from "@/lib/github-score";

/**
 * Score a public GitHub profile by username — no OAuth app needed.
 * Uses GitHub's unauthenticated REST API (public repos only, 60 req/hr/IP).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${request.headers.get("host") ?? url.host}`;
  const login = (url.searchParams.get("login") ?? "").trim().replace(/^@/, "");

  const back = (params: Record<string, string>) => {
    const dest = new URL("/profile", origin);
    for (const [k, v] of Object.entries(params)) dest.searchParams.set(k, v);
    return NextResponse.redirect(dest);
  };

  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(login)) {
    return back({ gh_error: "Enter a valid GitHub username." });
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "CollegeConnectors",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const userRes = await fetch(`https://api.github.com/users/${login}`, { headers });
  if (userRes.status === 404) return back({ gh_error: `No GitHub user “${login}”.` });
  if (!userRes.ok) {
    return back({
      gh_error:
        userRes.status === 403
          ? "GitHub rate limit hit. Try again in a few minutes."
          : "Could not reach GitHub.",
    });
  }
  const user = (await userRes.json()) as { login: string; name?: string | null };

  const reposRes = await fetch(
    `https://api.github.com/users/${login}/repos?per_page=100&sort=updated&type=owner`,
    { headers },
  );
  if (!reposRes.ok) return back({ gh_error: "Could not load repositories." });
  const breakdown = scoreGithubRepos((await reposRes.json()) as GhRepo[]);

  const payload = {
    login: user.login,
    name: user.name ?? null,
    score: breakdown.score,
    repoCount: breakdown.repoCount,
    originalCount: breakdown.originalCount,
    languages: breakdown.languages.slice(0, 8),
    highlights: breakdown.highlights,
    factors: breakdown.factors,
    scoredAt: Date.now(),
  };

  const cookieStore = await cookies();
  cookieStore.set("cc_gh_profile", JSON.stringify(payload), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return back({ gh: "connected" });
}
