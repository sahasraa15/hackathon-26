"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Heart, RotateCcw, X } from "lucide-react";
import {
  buildMatchDeck,
  matchCards,
  personById,
  passesViewerFilter,
  type MatchCard,
} from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { HotspotProject } from "@/components/rung/HotspotProject";
import { cn } from "@/lib/utils";

export default function MatchPage() {
  const {
    swipeMatch,
    matched,
    myMajor,
    myCollege,
    contentScope,
    sendMessage,
    setQuestion,
  } = useRung();
  const [deck, setDeck] = useState<MatchCard[]>([]);
  const [ready, setReady] = useState(false);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [passCount, setPassCount] = useState(0);

  useEffect(() => {
    const base =
      contentScope === "all"
        ? buildMatchDeck(myMajor, matched, { allMajors: true })
        : contentScope === "campus"
          ? matchCards.filter(
              (c) =>
                !matched.includes(c.personId) &&
                passesViewerFilter(personById(c.personId), {
                  contentScope,
                  myMajor,
                  myCollege,
                }),
            )
          : buildMatchDeck(myMajor, matched, { allMajors: false });
    setDeck(base);
    setReady(true);
  }, [myMajor, myCollege, contentScope, matched]);

  const card = deck[0];
  const upcoming = deck.slice(1, 3);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-10, 10]);
  const likeOpacity = useTransform(x, [40, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -40], [1, 0]);

  function rotateToBack(current: MatchCard) {
    setDeck((prev) => {
      if (prev.length <= 1) return prev;
      const [, ...rest] = prev;
      return [...rest, current];
    });
    setPassCount((n) => n + 1);
  }

  function removeFromDeck(cardId: string) {
    setDeck((prev) => prev.filter((c) => c.id !== cardId));
  }

  function decide(dir: "left" | "right") {
    if (!card || exitDir) return;
    setExitDir(dir);
    window.setTimeout(() => {
      if (dir === "right") {
        swipeMatch(card.id, card.personId);
        removeFromDeck(card.id);
        const name = personById(card.personId).name.split(" ")[0];
        setToast(`${name} connected · they can message you back`);
        window.setTimeout(() => setToast(null), 2400);
      } else {
        // Pass → they cycle to the back so people keep coming around
        rotateToBack(card);
        if ((passCount + 1) % 5 === 0) {
          setToast("Passed folks come back later — keep swiping");
          window.setTimeout(() => setToast(null), 2000);
        }
      }
      setExitDir(null);
      x.set(0);
    }, 200);
  }

  function reshuffle() {
    const arr = [...deck];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setDeck(arr);
    setToast("Shuffled");
    window.setTimeout(() => setToast(null), 1800);
  }

  const connected = matched
    .map((id) => {
      try {
        return personById(id);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <div className="flex min-h-[calc(100%-1rem)] flex-col px-5 pt-4">
      <div className="cc-panel flex items-start justify-between gap-3 p-4">
        <div>
          <p className="cc-eyebrow">Find builders</p>
          <h1 className="cc-title mt-1 text-2xl">Match</h1>
          <p className="mt-1 text-sm font-semibold text-rung-mute">
            {deck.length} people cycling · pass = later
          </p>
        </div>
        <button
          type="button"
          onClick={reshuffle}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#fff59a] to-[#e4c4ff] px-3 py-1.5 text-[11px] font-extrabold text-rung-fg shadow-sm"
        >
          <RotateCcw className="size-3.5" />
          Shuffle
        </button>
      </div>

      <p className="mt-3 text-xs font-semibold text-rung-mute">
        Filter follows Settings → What I see. Heart to connect.
      </p>

      {connected.length > 0 && (
        <div className="cc-panel mt-4 p-3.5">
          <p className="cc-eyebrow">Connected</p>
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {connected.map((p) =>
              p ? (
                <div
                  key={p.id}
                  className="flex w-14 shrink-0 flex-col items-center gap-1"
                >
                  <div className="rounded-full bg-gradient-to-tr from-[#fff59a] to-[#e4c4ff] p-[2px]">
                    <div className="rounded-full bg-[#fbf8ff] p-[1.5px]">
                      <Avatar initials={p.avatar} role={p.role} size="sm" />
                    </div>
                  </div>
                  <span className="w-full truncate text-center text-[10px] text-rung-mute">
                    {p.name.split(" ")[0]}
                  </span>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}

      <div className="relative mt-5 flex flex-1 flex-col items-center justify-center">
        {!ready ? null : card ? (
          <div className="relative h-[420px] w-full max-w-[340px]">
            {upcoming
              .map((c, i) => (
                <div
                  key={c.id}
                  className="cc-panel absolute inset-0 overflow-hidden"
                  style={{
                    transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * 10}px)`,
                    zIndex: 10 - i,
                    opacity: 1 - (i + 1) * 0.15,
                  }}
                >
                  <MatchPeek card={c} />
                </div>
              ))
              .reverse()}

            <AnimatePresence mode="popLayout">
              <motion.div
                key={card.id + String(passCount)}
                style={{ x, rotate, zIndex: 20 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 110) decide("right");
                  else if (info.offset.x < -110) decide("left");
                }}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: exitDir === "right" ? 340 : exitDir === "left" ? -340 : 0,
                }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                <MatchFace
                  card={card}
                  likeOpacity={likeOpacity}
                  passOpacity={passOpacity}
                  onAsk={(prompt) => {
                    sendMessage(card.personId, prompt);
                    setQuestion(prompt);
                    setToast("Message drafted");
                    window.setTimeout(() => setToast(null), 1800);
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
            <div className="cc-panel p-8 text-center">
            <p className="font-semibold text-rung-fg">Deck quiet for now</p>
            <p className="mt-2 text-sm text-rung-mute">
              Widen your filter in Settings or check People.
            </p>
          </div>
        )}
      </div>

      {toast && (
        <p className="mb-2 text-center text-xs font-medium text-rung-ember">
          {toast}
        </p>
      )}

      {card && (
        <div className="mb-5 mt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => decide("left")}
            className="flex size-14 items-center justify-center rounded-full border border-black/[0.08] bg-white text-rung-fg"
            aria-label="Pass — send to back"
          >
            <X className="size-6" />
          </button>
          <p className="w-16 text-center text-[10px] font-medium text-rung-mute">
            {deck.length} left
          </p>
          <button
            type="button"
            onClick={() => decide("right")}
            className="flex size-14 items-center justify-center rounded-full bg-[#e5ccff] text-rung-fg"
            aria-label="Connect"
          >
            <Heart className="size-6" />
          </button>
        </div>
      )}
    </div>
  );
}

function MatchPeek({ card }: { card: MatchCard }) {
  const person = personById(card.personId);
  return (
    <div className="flex h-full flex-col">
      {card.projectImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.projectImage}
          alt=""
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-[#f6efff]">
          <Avatar initials={person.avatar} role={person.role} size="xl" />
        </div>
      )}
      <div className="p-4">
        <p className="font-semibold text-rung-fg">{person.name}</p>
        <p className="text-xs text-rung-mute">{card.headline}</p>
      </div>
    </div>
  );
}

function MatchFace({
  card,
  likeOpacity,
  passOpacity,
  onAsk,
}: {
  card: MatchCard;
  likeOpacity: MotionValue<number>;
  passOpacity: MotionValue<number>;
  onAsk: (prompt: string) => void;
}) {
  const person = personById(card.personId);

  return (
    <div className="cc-panel flex h-full flex-col overflow-hidden">
      <div className="relative shrink-0">
        <motion.span
          style={{ opacity: likeOpacity }}
          className="absolute left-3 top-3 z-30 rounded-lg border border-rung-ember/40 bg-white/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-rung-ember"
        >
          Connect
        </motion.span>
        <motion.span
          style={{ opacity: passOpacity }}
          className="absolute right-3 top-3 z-30 rounded-lg border border-black/15 bg-white/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-rung-mute"
        >
          Later
        </motion.span>

        {card.projectImage && card.hotspots?.length ? (
          <HotspotProject
            image={card.projectImage}
            hotspots={card.hotspots}
            onAsk={onAsk}
            className="rounded-none"
          />
        ) : card.projectImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.projectImage}
            alt=""
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex aspect-[4/3] items-center justify-center",
              person.role === "industry"
                ? "bg-[#ffffc5]"
                : person.role === "faculty"
                  ? "bg-[#f0e0ff]"
                  : "bg-[#f6efff]",
            )}
          >
            <Avatar
              initials={person.avatar}
              role={person.role}
              size="xl"
              className="mx-auto"
            />
          </div>
        )}
      </div>

      <div className="space-y-2.5 overflow-y-auto p-4">
        <div className="flex items-center gap-3">
          <Avatar initials={person.avatar} role={person.role} size="sm" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-rung-fg">
              {person.name}
            </h2>
            <p className="truncate text-xs text-rung-mute">
              {person.major || person.company || person.department} ·{" "}
              {person.college}
            </p>
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-rung-ember">
          {card.headline}
        </p>
        <p className="text-sm leading-snug text-rung-fg/90">{card.why}</p>
        <div className="flex flex-wrap gap-1.5">
          {card.sharedSkills.map((s) => (
            <span
              key={s}
              className="rounded-full bg-[#fffcf5] px-2.5 py-1 text-xs text-rung-mute"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
