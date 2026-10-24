"use client";

import { useMemo } from "react";
import { personById, sameMajorFamily } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { ReelSlide } from "@/components/rung/ReelSlide";

export default function ReelsPage() {
  const { demos, myMajor, majorOnly, setMajorOnly } = useRung();

  const filtered = useMemo(() => {
    if (!majorOnly) return demos;
    return demos.filter((d) =>
      sameMajorFamily(personById(d.authorId).major, myMajor),
    );
  }, [demos, majorOnly, myMajor]);

  return (
    <div className="relative h-full bg-black">
      <div className="absolute left-3 right-3 top-[max(2.75rem,env(safe-area-inset-top))] z-20 flex items-center justify-between sm:top-10">
        <p className="text-sm font-semibold text-white drop-shadow">Reels</p>
        <button
          type="button"
          onClick={() => setMajorOnly(!majorOnly)}
          className="rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"
        >
          {majorOnly ? myMajor : "All majors"}
        </button>
      </div>

      <div className="h-full snap-y snap-mandatory overflow-y-auto scrollbar-none">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <p className="text-base font-semibold text-white">
              No {myMajor} reels yet
            </p>
            <p className="mt-2 text-sm text-white/60">
              Switch major in Profile, or tap “All majors” above.
            </p>
          </div>
        ) : (
          filtered.map((d) => (
            <div key={d.id} className="h-full">
              <ReelSlide demoId={d.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
