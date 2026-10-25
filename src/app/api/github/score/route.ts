import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { computeGithubProfile } from "@/lib/github-profile";

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

  let payload;
  try {
    payload = await computeGithubProfile(token);
  } catch {
    return NextResponse.json({ error: "score_failed" }, { status: 502 });
  }

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
