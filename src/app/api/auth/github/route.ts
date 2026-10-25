import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Use the host the browser used; the dev server binds 0.0.0.0, which
  // would otherwise leak into redirects and land on a different origin.
  const origin = `${url.protocol}//${request.headers.get("host") ?? url.host}`;
  const returnTo = url.searchParams.get("returnTo") || "/profile";

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    // Bounce back to the app with a readable error instead of a JSON page
    const dest = new URL(returnTo.startsWith("/") ? returnTo : "/profile", origin);
    dest.searchParams.set(
      "gh_error",
      "GitHub isn't set up yet. Add GITHUB_CLIENT_ID to .env.local (see env.example).",
    );
    return NextResponse.redirect(dest);
  }
  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("gh_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  cookieStore.set("gh_oauth_return", returnTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    `${origin}/api/auth/github/callback`;

  const auth = new URL("https://github.com/login/oauth/authorize");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("scope", "read:user user:email public_repo");
  auth.searchParams.set("state", state);

  return NextResponse.redirect(auth.toString());
}
