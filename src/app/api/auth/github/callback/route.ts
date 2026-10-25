import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { computeGithubProfile } from "@/lib/github-profile";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Use the host the browser used; the dev server binds 0.0.0.0, which
  // would otherwise leak into redirects and land on a different origin.
  const origin = `${url.protocol}//${request.headers.get("host") ?? url.host}`;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expected = cookieStore.get("gh_oauth_state")?.value;
  const returnTo = cookieStore.get("gh_oauth_return")?.value || "/profile";

  const fail = (message: string) => {
    const dest = new URL(returnTo, origin);
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
    process.env.GITHUB_REDIRECT_URI || `${origin}/api/auth/github/callback`;

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

  let payload;
  try {
    payload = await computeGithubProfile(token);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not load GitHub data.");
  }

  cookieStore.set("cc_gh_profile", JSON.stringify(payload), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  // Keep token server-side only for optional rescore + AI feedback
  cookieStore.set("cc_gh_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  cookieStore.delete("gh_oauth_state");
  cookieStore.delete("gh_oauth_return");

  const dest = new URL(returnTo, origin);
  dest.searchParams.set("gh", "connected");
  return NextResponse.redirect(dest);
}
