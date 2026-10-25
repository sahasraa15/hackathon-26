import { fetchGithubGraph } from "./github-graphql";
import { scoreFromGraph } from "./github-score-v2";
import { scoreGithubRepos, type GhRepo, type ScoreBreakdown } from "./github-score";

/** Builds the cookie/API payload. Tries the v2 score, falls back to the old REST scorer. */
export async function computeGithubProfile(token: string) {
  let login: string;
  let name: string | null;
  let breakdown: ScoreBreakdown;

  try {
    const viewer = await fetchGithubGraph(token);
    breakdown = scoreFromGraph(viewer);
    login = viewer.login;
    name = viewer.name;
  } catch (e) {
    console.error("v2 scoring failed, falling back to REST scorer:", e);
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "CollegeConnectors",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const userRes = await fetch("https://api.github.com/user", { headers });
    if (!userRes.ok) throw new Error("Could not load GitHub user.");
    const user = (await userRes.json()) as { login: string; name?: string };
    const reposRes = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator",
      { headers },
    );
    if (!reposRes.ok) throw new Error("Could not load repositories.");
    breakdown = scoreGithubRepos((await reposRes.json()) as GhRepo[]);
    login = user.login;
    name = user.name ?? null;
  }

  return {
    login,
    name,
    score: breakdown.score,
    repoCount: breakdown.repoCount,
    originalCount: breakdown.originalCount,
    languages: breakdown.languages.slice(0, 8),
    highlights: breakdown.highlights,
    factors: breakdown.factors,
    scoredAt: Date.now(),
  };
}
