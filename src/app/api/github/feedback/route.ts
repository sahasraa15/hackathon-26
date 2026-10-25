import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fetchGithubGraph } from "@/lib/github-graphql";
import { scoreFromGraph, type ScoreV2, type CategoryKey } from "@/lib/github-score-v2";
import { projectsForRating } from "@/lib/rung-data";

type Feedback = {
  summary: string;
  strengths: string[];
  improvements: { title: string; action: string }[];
  suggestedProjectId: string;
  source: "ai" | "template";
};

// Simple in-memory cache (fine for a hackathon). Key changes only when the score does.
const cache = new Map<string, Feedback>();

const TEMPLATE_TIPS: Record<CategoryKey, { title: string; action: string }> = {
  quality: {
    title: "Polish your best repo",
    action: "Add a README with setup steps, a license, and a tests folder to your strongest project.",
  },
  consistency: {
    title: "Build a steady rhythm",
    action: "Aim for one small commit a week. Active weeks matter more than big bursts.",
  },
  depth: {
    title: "Add real structure",
    action: "Build something with a backend, a database, or a Dockerfile to show full-stack skills.",
  },
  collaboration: {
    title: "Work with others",
    action: "Open a pull request on someone else's repo or review a classmate's PR.",
  },
  community: {
    title: "Share your work",
    action: "Add topics and a clear description so people can discover your projects.",
  },
};

function templateFeedback(s: ScoreV2, fallbackProjectId: string): Feedback {
  const best = [...s.categories].sort((a, b) => b.score - a.score)[0];
  const lows = [...s.categories].sort((a, b) => a.score - b.score).slice(0, 2);
  return {
    summary: `Your score is ${s.score}. Your strongest area is ${best.label.toLowerCase()}.`,
    strengths: [`${best.label} is at ${best.score}/100. Nice work.`],
    improvements: lows.map((l) => TEMPLATE_TIPS[l.key]),
    suggestedProjectId: fallbackProjectId,
    source: "template",
  };
}

const SYSTEM = `You are a friendly mentor inside a student-to-professional networking app.
You receive a JSON breakdown of a student's GitHub score. The score is already computed. NEVER change it or invent a different one.
Rules:
- Use ONLY the data provided. Never invent repos, files, or numbers.
- Coach, don't judge. Lead with a real strength.
- Every improvement must be a concrete next step that references a specific repo name or signal from the data.
- Pick suggestedProjectId ONLY from the provided catalog ids.
- Respond with JSON only, no prose and no code fences, in exactly this shape:
{"summary": string (1 sentence), "strengths": string[] (1-2), "improvements": [{"title": string, "action": string}] (2-3), "suggestedProjectId": string}`;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cc_gh_token")?.value;
  if (!token) return NextResponse.json({ connected: false }, { status: 401 });

  let scored: ScoreV2;
  try {
    scored = scoreFromGraph(await fetchGithubGraph(token));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "score_failed" },
      { status: 502 },
    );
  }

  const catalog = projectsForRating(scored.score).slice(0, 5);
  const fallbackId = catalog[0]?.id ?? "";
  const key = `${scored.categories.map((c) => c.score).join("-")}:${scored.score}`;
  const hit = cache.get(key);
  const respond = (fb: Feedback) => {
    const p = catalog.find((x) => x.id === fb.suggestedProjectId);
    return NextResponse.json({
      score: scored.score,
      categories: scored.categories,
      feedback: fb,
      project: p ? { id: p.id, title: p.title, difficulty: p.difficulty } : null,
    });
  };
  if (hit) return respond(hit);

  let feedback: Feedback;
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("no key");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(8000), // don't let a slow API hang the demo
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 700,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: JSON.stringify({
              score: scored.score,
              categories: scored.categories,
              weakestCategory: scored.weakest,
              signals: scored.signals,
              topRepos: scored.topRepos,
              projectCatalog: catalog.map((p) => ({
                id: p.id,
                title: p.title,
                blurb: p.blurb,
                difficulty: p.difficulty,
              })),
            }),
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);

    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    const text = data.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    const validId = catalog.some((p) => p.id === parsed.suggestedProjectId);
    feedback = {
      summary: String(parsed.summary),
      strengths: (parsed.strengths as string[]).slice(0, 2),
      improvements: (parsed.improvements as { title: string; action: string }[]).slice(0, 3),
      suggestedProjectId: validId ? parsed.suggestedProjectId : fallbackId,
      source: "ai",
    };
  } catch {
    feedback = templateFeedback(scored, fallbackId);
  }

  cache.set(key, feedback);
  return respond(feedback);
}
