import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "Missing GITHUB_CLIENT_ID. Add it to .env.local (see env.example).",
      },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || "/profile";
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
    `${url.origin}/api/auth/github/callback`;

  const auth = new URL("https://github.com/login/oauth/authorize");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("scope", "read:user user:email public_repo");
  auth.searchParams.set("state", state);

  return NextResponse.redirect(auth.toString());
}
