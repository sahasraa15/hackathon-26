"use client";

import { useCallback, useEffect, useState } from "react";

type Category = { key: string; label: string; score: number; weight: number };
type FeedbackResponse = {
  score: number;
  categories: Category[];
  feedback: {
    summary: string;
    strengths: string[];
    improvements: { title: string; action: string }[];
    source: "ai" | "template";
  };
  project: { id: string; title: string; difficulty: number } | null;
};

/** Score breakdown + AI coaching. Pass `scoredAt` so it refetches after a rescore. */
export function GithubFeedback({ scoredAt }: { scoredAt: number }) {
  const [data, setData] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github/feedback");
      if (!res.ok) throw new Error("Couldn't load feedback");
      setData((await res.json()) as FeedbackResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load feedback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, scoredAt]);

  if (loading) {
    return (
      <p className="mt-4 border-t border-black/[0.06] pt-4 text-xs text-rung-mute">
        Reading your repos…
      </p>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-4 border-t border-black/[0.06] pt-4">
        <p className="text-xs text-red-600">{error ?? "No feedback yet."}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-2 text-xs font-medium text-rung-ember"
        >
          Try again
        </button>
      </div>
    );
  }

  const { categories, feedback, project } = data;

  return (
    <div className="mt-4 space-y-4 border-t border-black/[0.06] pt-4">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-rung-mute">
          Score breakdown
        </p>
        {categories.map((c) => (
          <div key={c.key}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-rung-fg">{c.label}</span>
              <span className="tabular-nums text-rung-mute">
                {c.score}
                <span className="ml-1 text-[10px]">· {Math.round(c.weight * 100)}%</span>
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-[#e5ccff]"
                style={{ width: `${c.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-rung-mute">
          Your coach {feedback.source === "ai" ? "· AI" : ""}
        </p>
        <p className="text-sm text-rung-fg">{feedback.summary}</p>
        {feedback.strengths.length > 0 && (
          <ul className="space-y-1">
            {feedback.strengths.map((s) => (
              <li key={s} className="text-xs text-rung-fg">
                ✓ {s}
              </li>
            ))}
          </ul>
        )}
        <ul className="space-y-2 pt-1">
          {feedback.improvements.map((i) => (
            <li
              key={i.title}
              className="rounded-xl border border-black/[0.06] px-3 py-2"
            >
              <p className="text-xs font-semibold text-rung-fg">{i.title}</p>
              <p className="mt-0.5 text-xs text-rung-mute">{i.action}</p>
            </li>
          ))}
        </ul>
      </div>

      {project && (
        <p className="text-xs text-rung-mute">
          Try next:{" "}
          <span className="font-medium text-rung-ember">{project.title}</span>{" "}
          · Diff {project.difficulty}/5
        </p>
      )}
    </div>
  );
}
