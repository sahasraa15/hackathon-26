/**
 * v2 score: five weighted categories, all derived from GitHub account metadata.
 * Deterministic and explainable. The AI layer only *explains* this output.
 * Returns a superset of ScoreBreakdown so existing UI (factors, highlights) keeps working.
 */
import type { ScoreBreakdown } from "./github-score";
import type { GqlRepo, GqlViewer } from "./github-graphql";

export const WEIGHTS = {
  quality: 0.35,
  consistency: 0.2,
  depth: 0.2,
  collaboration: 0.15,
  community: 0.1,
} as const;

export type CategoryKey = keyof typeof WEIGHTS;

export type RepoFindings = {
  name: string;
  hasReadme: boolean;
  hasTests: boolean;
  hasCI: boolean;
  hasLicense: boolean;
  hasDescription: boolean;
  commits: number;
  complexitySignals: string[];
};

export type ScoreV2 = ScoreBreakdown & {
  categories: { key: CategoryKey; label: string; score: number; weight: number }[];
  signals: string[];
  topRepos: RepoFindings[];
  weakest: CategoryKey;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const logNorm = (n: number, cap: number) =>
  clamp01(Math.log10(1 + Math.max(0, n)) / Math.log10(1 + cap));
const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

const MANIFESTS = new Set([
  "package.json", "requirements.txt", "pyproject.toml", "cargo.toml", "go.mod",
  "pom.xml", "build.gradle", "gemfile", "composer.json",
]);
const DB_NAMES = new Set([
  "prisma", "migrations", "alembic", "db", "database", "schema.sql", "models",
]);
const STRUCTURE = new Set([
  "api", "server", "backend", "routes", "controllers", "src", "app", "services",
]);

function analyzeRepo(r: GqlRepo) {
  const entries = (r.root?.entries ?? []).map((e) => ({
    name: e.name.toLowerCase(),
    type: e.type,
  }));
  const has = (pred: (n: string) => boolean) => entries.some((e) => pred(e.name));

  const hasReadme =
    (r.readme?.byteSize ?? 0) > 0 || has((n) => n.startsWith("readme"));
  const readmeSubstantial = (r.readme?.byteSize ?? 0) >= 500;
  const hasTests = has(
    (n) =>
      /^(tests?|__tests__|spec|specs|e2e|cypress)$/.test(n) ||
      /^(jest|vitest|playwright)\.config/.test(n) ||
      n === "pytest.ini" ||
      n === "conftest.py",
  );
  // Note: a bare .github folder may only hold issue templates. Good enough as a metadata proxy.
  const hasCI = has((n) =>
    [".github", ".circleci", ".travis.yml", ".gitlab-ci.yml", "jenkinsfile"].includes(n),
  );
  const hasLicense = Boolean(
    r.licenseInfo?.spdxId && r.licenseInfo.spdxId !== "NOASSERTION",
  );
  const hasDescription = (r.description?.trim().length ?? 0) > 20;

  const signals: string[] = [];
  if (has((n) => n === "dockerfile" || n.startsWith("docker-compose"))) signals.push("containerized");
  if (has((n) => MANIFESTS.has(n))) signals.push("dependency manifest");
  if (has((n) => DB_NAMES.has(n))) signals.push("database layer");
  if (has((n) => STRUCTURE.has(n))) signals.push("structured source layout");
  const dirCount = entries.filter((e) => e.type === "tree").length;
  if (dirCount >= 3) signals.push("multiple modules");

  const kb = r.diskUsage ?? 0;
  const substance = logNorm(kb, 2000);

  const quality =
    0.25 * (readmeSubstantial ? 1 : hasReadme ? 0.4 : 0) +
    0.25 * (hasTests ? 1 : 0) +
    0.15 * (hasCI ? 1 : 0) +
    0.1 * (hasLicense ? 1 : 0) +
    0.1 * (hasDescription ? 1 : 0) +
    0.15 * substance;

  const complexity = signals.length / 5;

  const commits = r.defaultBranchRef?.target?.history?.totalCount ?? 0;
  const months =
    (new Date(r.pushedAt ?? r.createdAt).getTime() - new Date(r.createdAt).getTime()) /
    (1000 * 60 * 60 * 24 * 30);
  const sustained = 0.5 * clamp01(months / 12) + 0.5 * logNorm(commits, 200);

  const findings: RepoFindings = {
    name: r.name,
    hasReadme,
    hasTests,
    hasCI,
    hasLicense,
    hasDescription,
    commits,
    complexitySignals: signals,
  };
  return { quality, complexity, sustained, findings };
}

export function scoreFromGraph(v: GqlViewer): ScoreV2 {
  const repos = v.repositories.nodes.filter((r) => !r.isArchived);
  const analyzed = repos
    .map((r) => ({ r, ...analyzeRepo(r) }))
    .sort((a, b) => b.quality + b.complexity - (a.quality + a.complexity));
  const top = analyzed.slice(0, 5);
  const c = v.contributionsCollection;

  // 1) Project quality — top repos, padded so one polished repo isn't a perfect score
  const denom = Math.min(5, Math.max(3, top.length));
  const quality = clamp01(top.reduce((s, x) => s + x.quality, 0) / denom);

  // 2) Consistency — active weeks in the last year (30 active weeks = full marks)
  const weeks = c.contributionCalendar.weeks;
  const activeWeeks = weeks.filter((w) =>
    w.contributionDays.some((d) => d.contributionCount > 0),
  ).length;
  const consistency = clamp01(activeWeeks / 30);

  // 3) Technical depth — breadth 25 / complexity 35 / sustained 25 / volume 15
  const bytesByLang = new Map<string, number>();
  for (const r of repos)
    for (const e of r.languages.edges)
      bytesByLang.set(e.node.name, (bytesByLang.get(e.node.name) ?? 0) + e.size);
  const meaningful = [...bytesByLang.entries()].filter(([, b]) => b >= 5000);
  const totalBytes = [...bytesByLang.values()].reduce((a, b) => a + b, 0);
  const breadth = clamp01(meaningful.length / 5);
  const complexity = mean(top.map((x) => x.complexity));
  const sustained = mean(
    [...analyzed].sort((a, b) => b.sustained - a.sustained).slice(0, 3).map((x) => x.sustained),
  );
  const volume = logNorm(totalBytes, 500_000);
  const depth = 0.25 * breadth + 0.35 * complexity + 0.25 * sustained + 0.15 * volume;

  // 4) Collaboration — PRs, reviews, issues, and work on other people's repos
  const external = c.pullRequestContributionsByRepository.filter(
    (x) => x.repository.owner.login.toLowerCase() !== v.login.toLowerCase(),
  );
  const collaboration = clamp01(
    0.3 * clamp01(c.totalPullRequestContributions / 15) +
      0.2 * clamp01(c.totalPullRequestReviewContributions / 10) +
      0.1 * clamp01(c.totalIssueContributions / 10) +
      0.4 * clamp01(external.length / 3),
  );

  // 5) Community — log-scaled and capped so popularity can't dominate
  const stars = repos.reduce((s, r) => s + r.stargazerCount, 0);
  const forks = repos.reduce((s, r) => s + r.forkCount, 0);
  const community = clamp01(0.7 * logNorm(stars, 50) + 0.3 * logNorm(forks, 15));

  const raw: Record<CategoryKey, number> = {
    quality, consistency, depth, collaboration, community,
  };
  const labels: Record<CategoryKey, string> = {
    quality: "Project quality",
    consistency: "Consistency",
    depth: "Technical depth",
    collaboration: "Collaboration",
    community: "Community",
  };
  const categories = (Object.keys(WEIGHTS) as CategoryKey[]).map((key) => ({
    key,
    label: labels[key],
    score: Math.round(raw[key] * 100),
    weight: WEIGHTS[key],
  }));

  const total = categories.reduce((s, x) => s + (x.score / 100) * x.weight, 0);
  // Floor of 5 so brand-new users aren't zero (cold start)
  const score = Math.round(Math.max(5, Math.min(98, total * 100)));

  // Weakest category relative to its potential contribution drives the feedback focus
  const weakest = [...categories].sort(
    (a, b) => (1 - a.score / 100) * a.weight - (1 - b.score / 100) * b.weight,
  )[categories.length - 1].key;

  const signals = [
    `${activeWeeks} of ${weeks.length} weeks active in the last year`,
    `${c.totalPullRequestContributions} PRs, ${c.totalPullRequestReviewContributions} reviews, ${c.totalIssueContributions} issues this year`,
    `${external.length} repos contributed to that the user doesn't own`,
    `${meaningful.length} languages with meaningful code: ${meaningful.map(([n]) => n).join(", ") || "none"}`,
    `${stars} total stars, ${forks} total forks`,
  ];

  const languages = [...bytesByLang.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => n);

  return {
    score,
    repoCount: v.repositories.totalCount,
    originalCount: repos.length,
    languages,
    highlights: top.slice(0, 3).map((t) => t.r.name),
    // Keeps the existing profile UI working (it renders `factors`)
    factors: categories.map((x) => ({
      label: x.label,
      points: Math.round(x.score * x.weight),
    })),
    categories,
    signals,
    topRepos: top.slice(0, 3).map((t) => t.findings),
    weakest,
  };
}
