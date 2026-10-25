"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard, Heart, MessageCircle, X } from "lucide-react";
import { personById, projectUpdates, sameMajorFamily } from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { StoriesBar } from "@/components/rung/StoriesBar";
import { Avatar } from "@/components/rung/Avatar";
import { DeviceOverlay } from "@/components/rung/DeviceOverlay";
import { cn } from "@/lib/utils";

const kindLabel = {
  milestone: "Update",
  blocker: "Help",
  ship: "Done",
  ask: "Ask",
  win: "Win",
} as const;

const kindAccent = {
  milestone: "from-[#e5ccff] to-[#f6efff]",
  blocker: "from-[#ffe2c5] to-[#ffffc5]",
  ship: "from-[#ffffc5] to-[#e5ccff]",
  ask: "from-[#e5ccff] to-[#ffe2c5]",
  win: "from-[#f6efff] to-[#ffffc5]",
} as const;

export default function FeedPage() {
  const { myMajor, majorOnly, setMajorOnly, exploreMajors } = useRung();
  const [lightbox, setLightbox] = useState<{
    src?: string;
    title: string;
    body?: string;
    posterTone?: string;
    reelHref?: string;
  } | null>(null);
  const [cheered, setCheered] = useState<Set<string>>(() => new Set());

  const updates = useMemo(() => {
    if (!majorOnly) return projectUpdates;
    return projectUpdates.filter((u) =>
      sameMajorFamily(personById(u.authorId).major, myMajor, exploreMajors),
    );
  }, [majorOnly, myMajor, exploreMajors]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
            Updates
          </h1>
          <p className="mt-0.5 text-xs text-rung-mute">{myMajor} feed</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMajorOnly(!majorOnly)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-semibold",
              majorOnly
                ? "bg-[#e5ccff] text-rung-fg"
                : "bg-white text-rung-mute ring-1 ring-black/[0.08]",
            )}
          >
            {majorOnly ? "My major" : "All"}
          </button>
          <Link
            href="/reels"
            className="flex items-center gap-1 rounded-full bg-rung-fg px-3 py-1.5 text-[11px] font-semibold text-white"
          >
            <Clapperboard className="size-3.5" />
            Reels
          </Link>
        </div>
      </div>

      <StoriesBar />

      <ul className="space-y-3 px-4 pb-8">
        {updates.length === 0 && (
          <li className="rounded-2xl border border-black/[0.06] bg-white px-5 py-8 text-center">
            <p className="font-semibold text-rung-fg">No {myMajor} updates</p>
            <p className="mt-1 text-sm text-rung-mute">
              Pick another major in Profile, or switch to All above.
            </p>
          </li>
        )}
        {updates.map((u) => {
          const author = personById(u.authorId);
          const hasMedia = Boolean(u.image || u.posterTone);
          return (
            <li
              key={u.id}
              className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"
            >
              <div
                className={cn("h-1.5 bg-gradient-to-r", kindAccent[u.kind])}
              />
              <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                  <Avatar initials={author.avatar} role={author.role} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-rung-fg">
                        {author.name}
                      </p>
                      <span className="rounded-full bg-[#f6efff] px-2 py-0.5 text-[10px] font-semibold text-rung-ember">
                        {kindLabel[u.kind]}
                      </span>
                      <span className="text-xs text-rung-mute">
                        {u.hoursAgo}h
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-rung-mute">
                      <span className="rounded bg-[#ffffc5] px-1.5 py-0.5 text-rung-fg">
                        {author.major}
                      </span>{" "}
                      · {u.projectTitle}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[15px] leading-snug text-rung-fg">
                  {u.body}
                </p>
              </div>

              {hasMedia && (
                <button
                  type="button"
                  className="relative block w-full overflow-hidden"
                  onClick={() =>
                    setLightbox({
                      src: u.image,
                      title: u.projectTitle,
                      body: u.body,
                      posterTone: u.posterTone,
                      reelHref: u.reelHref,
                    })
                  }
                >
                  {u.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.image}
                      alt={u.projectTitle}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex aspect-[4/5] w-full flex-col justify-end bg-gradient-to-br p-5",
                        u.posterTone,
                      )}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rung-mute">
                        {author.major}
                      </p>
                      <p className="mt-2 text-2xl font-semibold leading-snug text-rung-fg">
                        {u.projectTitle}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm text-rung-fg/80">
                        {u.body}
                      </p>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                    Tap to open
                  </span>
                </button>
              )}

              <div className="flex items-center gap-1 border-t border-black/[0.05] px-2 py-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCheered((prev) => {
                      const next = new Set(prev);
                      if (next.has(u.id)) next.delete(u.id);
                      else next.add(u.id);
                      return next;
                    })
                  }
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium active:bg-[#f6efff]",
                    cheered.has(u.id) ? "text-rung-ember" : "text-rung-mute",
                  )}
                >
                  <Heart
                    className={cn(
                      "size-4",
                      cheered.has(u.id) && "fill-[#e5ccff] text-[#e5ccff]",
                    )}
                  />
                  Cheer
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-rung-mute active:bg-[#f6efff]"
                >
                  <MessageCircle className="size-4" /> Reply
                </button>
                <Link
                  href={u.reelHref || "/reels"}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-rung-ember active:bg-[#f6efff]"
                >
                  <Clapperboard className="size-4" /> Reel
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {lightbox && (
          <DeviceOverlay>
            <motion.div
              className="flex h-full flex-col bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between px-4 pb-2 pt-[max(2.5rem,env(safe-area-inset-top))] sm:pt-14">
                <p className="text-sm font-semibold text-white">
                  {lightbox.title}
                </p>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="rounded-full bg-white/15 p-2 text-white"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center px-2">
                {lightbox.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lightbox.src}
                    alt={lightbox.title}
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <div
                    className={cn(
                      "mx-4 w-full rounded-2xl bg-gradient-to-br p-6",
                      lightbox.posterTone || "from-[#e5ccff] to-[#ffffc5]",
                    )}
                  >
                    <p className="text-2xl font-semibold text-rung-fg">
                      {lightbox.title}
                    </p>
                    {lightbox.body && (
                      <p className="mt-3 text-sm text-rung-fg/80">
                        {lightbox.body}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {lightbox.reelHref && (
                <div className="px-4 pb-8">
                  <Link
                    href={lightbox.reelHref}
                    onClick={() => setLightbox(null)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e5ccff] py-3 text-sm font-semibold text-rung-fg"
                  >
                    <Clapperboard className="size-4" />
                    Watch demo reel
                  </Link>
                </div>
              )}
            </motion.div>
          </DeviceOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
