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
  personById,
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
    majorOnly,
    exploreMajors,
    sendMessage,
    setQuestion,
  } = useRung();
  const [deck, setDeck] = useState<MatchCard[]>([]);
  const [ready, setReady] = useState(false);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [passCount, setPassCount] = useState(0);

  // Rebuild when profile major or matched set changes — majorOnly = only that major
  useEffect(() => {
    setDeck(
      buildMatchDeck(myMajor, matched, {
        allMajors: !majorOnly,
        alsoExplore: exploreMajors,
      }),
    );
    setReady(true);
  }, [myMajor, majorOnly, matched, exploreMajors]);

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
    const arr = [
      ...buildMatchDeck(myMajor, matched, {
        allMajors: !majorOnly,
        alsoExplore: exploreMajors,
      }),
    ];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setDeck(arr);
    setToast(
      majorOnly
        ? `Shuffled · ${myMajor} only`
        : "Shuffled · all majors",
    );
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
            Match
          </h1>
          <p className="mt-1 text-sm text-rung-mute">
            {majorOnly ? myMajor : "All majors"} · {deck.length} in circulation
          </p>
        </div>
        <button
          type="button"
          onClick={reshuffle}
          className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-semibold text-rung-mute"
        >
          <RotateCcw className="size-3.5" />
          Shuffle
        </button>
      </div>

      <p className="mt-1 text-xs text-rung-mute">
        {majorOnly
          ? `Only ${myMajor} — change major in Profile.`
          : "Showing every major. Turn on “My major” in Profile to filter."}{" "}
        Pass sends them to the back.
      </p>

      {connected.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rung-mute">
            Connected
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {connected.map((p) =>
              p ? (
                <div
                  key={p.id}
                  className="flex w-14 shrink-0 flex-col items-center gap-1"
                >
                  <div className="rounded-full ring-2 ring-[#e5ccff] ring-offset-2 ring-offset-[#fffcf0]">
                    <Avatar initials={p.avatar} role={p.role} size="sm" />
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
                  className="absolute inset-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"
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
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="font-semibold text-rung-fg">
              {majorOnly
                ? `No more ${myMajor} matches`
                : "You’re connected"}
            </p>
            <p className="mt-2 text-sm text-rung-mute">
              {majorOnly
                ? "Shuffle, switch major in Profile, or open Network."
                : "Open Network to keep the conversation going."}
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
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
                  ? "bg-[#ffe2c5]"
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
              className="rounded-full bg-[#fffcf0] px-2.5 py-1 text-xs text-rung-mute"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
