import { NextResponse } from "next/server";
import { scoreGithubRepos, type GhRepo } from "@/lib/github-score";

const ghHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "CollegeConnectors-HackOHIO",
  "X-GitHub-Api-Version": "2022-11-28",
};

/** Score a public GitHub username — no OAuth required (hackathon-friendly). */
export async function POST(request: Request) {
  let login = "";
  try {
    const body = (await request.json()) as { login?: string };
    login = (body.login || "").trim().replace(/^@/, "");
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!login || !/^[a-zA-Z0-9-]{1,39}$/.test(login)) {
    return NextResponse.json({ error: "Enter a valid GitHub username" }, { status: 400 });
  }

  const userRes = await fetch(`https://api.github.com/users/${login}`, {
    headers: ghHeaders,
    next: { revalidate: 0 },
  });

  if (userRes.status === 404) {
    return NextResponse.json({ error: `No GitHub user “${login}”` }, { status: 404 });
  }
  if (userRes.status === 403) {
    return NextResponse.json(
      { error: "GitHub rate limit hit — try again in a minute" },
      { status: 429 },
    );
  }
  if (!userRes.ok) {
    return NextResponse.json({ error: "Could not load GitHub user" }, { status: 502 });
  }

  const user = (await userRes.json()) as { login: string; name?: string | null };

  const reposRes = await fetch(
    `https://api.github.com/users/${login}/repos?per_page=100&sort=updated&type=owner`,
    { headers: ghHeaders, next: { revalidate: 0 } },
  );

  if (!reposRes.ok) {
    return NextResponse.json({ error: "Could not load repositories" }, { status: 502 });
  }

  const repos = (await reposRes.json()) as GhRepo[];
  const breakdown = scoreGithubRepos(repos);

  return NextResponse.json({
    login: user.login,
    name: user.name ?? null,
    score: breakdown.score,
    repoCount: breakdown.repoCount,
    originalCount: breakdown.originalCount,
    languages: breakdown.languages.slice(0, 8),
    highlights: breakdown.highlights,
    factors: breakdown.factors,
    scoredAt: Date.now(),
    mode: "public",
  });
}
