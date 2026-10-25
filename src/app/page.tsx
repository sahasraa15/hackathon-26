"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard, Heart, MessageCircle, X } from "lucide-react";
import {
  personById,
  passesViewerFilter,
  projectUpdates,
} from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { StoriesBar } from "@/components/rung/StoriesBar";
import { Avatar } from "@/components/rung/Avatar";
import { DeviceOverlay } from "@/components/rung/DeviceOverlay";
import { Landing } from "@/components/rung/Landing";
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
  blocker: "from-[#f0e0ff] to-[#ffffc5]",
  ship: "from-[#ffffc5] to-[#e5ccff]",
  ask: "from-[#e5ccff] to-[#f0e0ff]",
  win: "from-[#f6efff] to-[#ffffc5]",
} as const;

export default function HomePage() {
  const {
    session,
    hydrated,
    myMajor,
    myCollege,
    contentScope,
  } = useRung();
  const [lightbox, setLightbox] = useState<{
    src?: string;
    title: string;
    body?: string;
    posterTone?: string;
    reelHref?: string;
  } | null>(null);
  const [cheered, setCheered] = useState<Set<string>>(() => new Set());

  const updates = useMemo(() => {
    return projectUpdates.filter((u) =>
      passesViewerFilter(personById(u.authorId), {
        contentScope,
        myMajor,
        myCollege,
      }),
    );
  }, [contentScope, myMajor, myCollege]);

  if (!hydrated) return null;
  if (!session) return <Landing />;

  const scopeLabel =
    contentScope === "major"
      ? `${myMajor} only`
      : contentScope === "campus"
        ? myCollege
        : "Everyone";

  return (
    <div>
      <div className="px-5 pt-3">
        <motion.div
          className="cc-panel relative overflow-hidden p-4"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-[#fff59a]/55 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-[#e4c4ff]/50 blur-2xl"
          />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <p className="cc-eyebrow">Tonight&apos;s feed</p>
              <h1 className="cc-title mt-1 text-2xl tracking-tight">
                What&apos;s cooking
              </h1>
              <p className="mt-1 text-xs font-bold text-rung-mute">
                {scopeLabel} · {updates.length} drops
              </p>
            </div>
            <Link href="/reels" className="cc-cta shrink-0">
              <Clapperboard className="size-3.5" />
              Reels
            </Link>
          </div>
        </motion.div>
      </div>

      <StoriesBar />

      <ul className="space-y-4 px-4 pb-8">
        {updates.length === 0 && (
          <li className="cc-panel px-5 py-8 text-center">
            <p className="cc-title text-lg">Quiet for now</p>
            <p className="mt-1 text-sm font-semibold text-rung-mute">
              Open Settings and switch to “Everything”.
            </p>
          </li>
        )}
        {updates.map((u, idx) => {
          const author = personById(u.authorId);
          const hasMedia = Boolean(u.image || u.posterTone);
          return (
            <motion.li
              key={u.id}
              className="cc-panel overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.24) }}
            >
              <div
                className={cn("h-1.5 bg-gradient-to-r", kindAccent[u.kind])}
              />
              <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                  <Avatar initials={author.avatar} role={author.role} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-rung-fg">
                        {author.name}
                      </p>
                      <span className="rounded-full bg-[#e4c4ff]/55 px-2 py-0.5 text-[10px] font-extrabold text-rung-ember">
                        {kindLabel[u.kind]}
                      </span>
                      <span className="text-xs font-bold text-rung-mute">
                        {u.hoursAgo}h
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-bold text-rung-mute">
                      <span className="rounded-md bg-[#fff59a] px-1.5 py-0.5 text-rung-fg">
                        {author.major}
                      </span>{" "}
                      · {u.projectTitle}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[15px] font-semibold leading-snug text-rung-fg">
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
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-rung-mute">
                        {author.major}
                      </p>
                      <p className="cc-title mt-2 text-2xl leading-snug">
                        {u.projectTitle}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm font-semibold text-rung-fg/80">
                        {u.body}
                      </p>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#2c1f3a]/70 px-2.5 py-1 text-[10px] font-extrabold text-[#fff59a] backdrop-blur">
                    Tap to open
                  </span>
                </button>
              )}

              <div className="flex items-center gap-1 border-t border-[#2c1f3a]/[0.05] bg-white/40 px-2 py-1.5">
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
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold active:bg-[#fff59a]/60",
                    cheered.has(u.id) ? "text-rung-ember" : "text-rung-mute",
                  )}
                >
                  <Heart
                    className={cn(
                      "size-4",
                      cheered.has(u.id) && "fill-[#e4c4ff] text-[#e4c4ff]",
                    )}
                  />
                  Cheer
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold text-rung-mute active:bg-[#e4c4ff]/40"
                >
                  <MessageCircle className="size-4" /> Reply
                </button>
                <Link
                  href={u.reelHref || "/reels"}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold text-rung-ember active:bg-[#e4c4ff]/40"
                >
                  <Clapperboard className="size-4" /> Reel
                </Link>
              </div>
            </motion.li>
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
                    <p className="cc-title text-2xl">{lightbox.title}</p>
                    {lightbox.body && (
                      <p className="mt-3 text-sm font-semibold text-rung-fg/80">
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
                    className="cc-cta flex w-full py-3 text-sm"
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
