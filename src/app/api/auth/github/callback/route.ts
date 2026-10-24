import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { scoreGithubRepos, type GhRepo } from "@/lib/github-score";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expected = cookieStore.get("gh_oauth_state")?.value;
  const returnTo = cookieStore.get("gh_oauth_return")?.value || "/profile";

  const fail = (message: string) => {
    const dest = new URL(returnTo, url.origin);
    dest.searchParams.set("gh_error", message);
    return NextResponse.redirect(dest);
  };

  if (err) return fail(err);
  if (!code || !state || !expected || state !== expected) {
    return fail("OAuth state mismatch. Try again.");
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return fail("Server missing GitHub OAuth credentials.");
  }

  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    `${url.origin}/api/auth/github/callback`;

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenJson.access_token) {
    return fail(tokenJson.error_description || tokenJson.error || "Token failed");
  }

  const token = tokenJson.access_token;
  const ghHeaders = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "CollegeConnectors",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const userRes = await fetch("https://api.github.com/user", {
    headers: ghHeaders,
  });
  if (!userRes.ok) return fail("Could not load GitHub user.");
  const user = (await userRes.json()) as { login: string; name?: string };

  // Paginate a bit — up to 100 repos is enough for scoring
  const reposRes = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator",
    { headers: ghHeaders },
  );
  if (!reposRes.ok) return fail("Could not load repositories.");
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

  // Keep token server-side only for optional rescore
  cookieStore.set("cc_gh_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  cookieStore.delete("gh_oauth_state");
  cookieStore.delete("gh_oauth_return");

  const dest = new URL(returnTo, url.origin);
  dest.searchParams.set("gh", "connected");
  return NextResponse.redirect(dest);
}
