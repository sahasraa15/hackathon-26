/** One GraphQL call that returns everything the v2 score needs (public data only). */

export type GqlRepo = {
  name: string;
  description: string | null;
  isArchived: boolean;
  stargazerCount: number;
  forkCount: number;
  createdAt: string;
  pushedAt: string | null;
  diskUsage: number | null; // KB
  licenseInfo: { spdxId: string | null } | null;
  languages: { edges: { size: number; node: { name: string } }[] };
  readme: { byteSize: number } | null;
  root: { entries: { name: string; type: string }[] } | null;
  defaultBranchRef: {
    target: { history?: { totalCount: number } } | null;
  } | null;
};

export type GqlViewer = {
  login: string;
  name: string | null;
  repositories: { totalCount: number; nodes: GqlRepo[] };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    totalIssueContributions: number;
    contributionCalendar: {
      weeks: { contributionDays: { contributionCount: number }[] }[];
    };
    pullRequestContributionsByRepository: {
      repository: { nameWithOwner: string; owner: { login: string } };
      contributions: { totalCount: number };
    }[];
  };
};

const QUERY = /* GraphQL */ `
  query ScoreViewer {
    viewer {
      login
      name
      repositories(
        first: 20
        ownerAffiliations: OWNER
        isFork: false
        privacy: PUBLIC
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        totalCount
        nodes {
          name
          description
          isArchived
          stargazerCount
          forkCount
          createdAt
          pushedAt
          diskUsage
          licenseInfo { spdxId }
          languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name } }
          }
          readme: object(expression: "HEAD:README.md") {
            ... on Blob { byteSize }
          }
          root: object(expression: "HEAD:") {
            ... on Tree { entries { name type } }
          }
          defaultBranchRef {
            target { ... on Commit { history { totalCount } } }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalIssueContributions
        contributionCalendar {
          weeks { contributionDays { contributionCount } }
        }
        pullRequestContributionsByRepository(maxRepositories: 25) {
          repository { nameWithOwner owner { login } }
          contributions { totalCount }
        }
      }
    }
  }
`;

export async function fetchGithubGraph(token: string): Promise<GqlViewer> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "CollegeConnectors",
    },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
  const json = (await res.json()) as {
    data?: { viewer: GqlViewer };
    errors?: { message: string }[];
  };
  if (!json.data?.viewer) {
    throw new Error(json.errors?.[0]?.message ?? "GraphQL returned no data");
  }
  return json.data.viewer;
}
