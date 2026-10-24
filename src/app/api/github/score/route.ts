import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { scoreGithubRepos, type GhRepo } from "@/lib/github-score";

/** Read cached score, or rescore with stored token. */
export async function GET() {
  const cookieStore = await cookies();
  const cached = cookieStore.get("cc_gh_profile")?.value;
  if (cached) {
    try {
      return NextResponse.json(JSON.parse(cached));
    } catch {
      /* fall through */
    }
  }

  const token = cookieStore.get("cc_gh_token")?.value;
  if (!token) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const ghHeaders = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "CollegeConnectors",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const userRes = await fetch("https://api.github.com/user", {
    headers: ghHeaders,
  });
  if (!userRes.ok) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }
  const user = (await userRes.json()) as { login: string; name?: string };

  const reposRes = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator",
    { headers: ghHeaders },
  );
  if (!reposRes.ok) {
    return NextResponse.json({ error: "repos_failed" }, { status: 502 });
  }
  const repos = (await reposRes.json()) as GhRepo[];
  const breakdown = scoreGithubRepos(repos);

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

  cookieStore.set("cc_gh_profile", JSON.stringify(payload), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json(payload);
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("cc_gh_profile");
  cookieStore.delete("cc_gh_token");
  return NextResponse.json({ ok: true });
}
