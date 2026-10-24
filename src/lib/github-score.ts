/** Score GitHub repos by complexity / substance (0–100). Meet-you-where-you-are, not a gate. */

export type GhRepo = {
  name: string;
  full_name: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  language: string | null;
  topics?: string[];
  has_pages?: boolean;
  archived?: boolean;
  disabled?: boolean;
  open_issues_count?: number;
  license?: { spdx_id?: string | null } | null;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  default_branch?: string;
  homepage?: string | null;
};

export type ScoreBreakdown = {
  score: number;
  repoCount: number;
  originalCount: number;
  languages: string[];
  highlights: string[];
  factors: { label: string; points: number }[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function daysSince(iso: string | null) {
  if (!iso) return 9999;
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

function logBoost(n: number, scale: number) {
  return Math.log10(1 + Math.max(0, n)) * scale;
}

/** Per-repo complexity contribution before portfolio aggregation */
export function repoComplexity(repo: GhRepo): number {
  if (repo.archived || repo.disabled) return 0;

  let pts = 0;

  // Original work weighs more than forks
  pts += repo.fork ? 1 : 8;

  // Description / homepage signal intentionality
  if (repo.description && repo.description.trim().length > 20) pts += 4;
  if (repo.homepage) pts += 2;

  // Language present
  if (repo.language) pts += 3;

  // Topics = structured project
  const topics = repo.topics?.length ?? 0;
  pts += clamp(topics * 1.5, 0, 6);

  // License
  if (repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION") pts += 3;

  // Size as rough proxy for substance (KB) — soft log
  pts += clamp(logBoost(repo.size, 2.2), 0, 10);

  // Community signal
  pts += clamp(logBoost(repo.stargazers_count, 4), 0, 12);
  pts += clamp(logBoost(repo.forks_count, 3), 0, 8);

  // Recency of pushes
  const age = daysSince(repo.pushed_at);
  if (age < 30) pts += 8;
  else if (age < 90) pts += 5;
  else if (age < 365) pts += 2;

  // Issues can mean active project (soft)
  pts += clamp((repo.open_issues_count ?? 0) * 0.3, 0, 4);

  if (repo.has_pages) pts += 2;

  return pts;
}

export function scoreGithubRepos(repos: GhRepo[]): ScoreBreakdown {
  const active = repos.filter((r) => !r.archived && !r.disabled);
  const originals = active.filter((r) => !r.fork);
  const pool = originals.length ? originals : active;

  const ranked = [...pool]
    .map((r) => ({ repo: r, pts: repoComplexity(r) }))
    .sort((a, b) => b.pts - a.pts);

  // Top repos dominate; long tail still adds a little
  const top = ranked.slice(0, 8);
  const rest = ranked.slice(8, 20);
  const topSum = top.reduce((s, x) => s + x.pts, 0);
  const restSum = rest.reduce((s, x) => s + x.pts, 0) * 0.35;

  const languages = [
    ...new Set(
      active.map((r) => r.language).filter((l): l is string => Boolean(l)),
    ),
  ];

  const diversity = clamp(languages.length * 3, 0, 15);
  const volume = clamp(originals.length * 2.5, 0, 20);
  const raw = topSum + restSum + diversity + volume;

  // Map raw points into 5–95 so beginners aren't zero and veterans aren't capped weirdly
  const score = Math.round(clamp(8 + raw * 0.55, 5, 95));

  const factors = [
    {
      label: "Top repos",
      points: Math.round(topSum * 0.55),
    },
    { label: "Languages", points: Math.round(diversity * 0.55) },
    { label: "Original projects", points: Math.round(volume * 0.55) },
  ];

  const highlights = top.slice(0, 3).map((t) => {
    const bits = [
      t.repo.language,
      t.repo.stargazers_count ? `★${t.repo.stargazers_count}` : null,
      t.repo.fork ? "fork" : null,
    ].filter(Boolean);
    return `${t.repo.name}${bits.length ? ` (${bits.join(" · ")})` : ""}`;
  });

  return {
    score,
    repoCount: active.length,
    originalCount: originals.length,
    languages,
    highlights,
    factors,
  };
}
