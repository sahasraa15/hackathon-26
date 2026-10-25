"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Search } from "lucide-react";
import {
  mentorsForQuestion,
  people,
  personById,
  shopItems,
} from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { cn } from "@/lib/utils";

export default function MentorsPage() {
  const { points, question, setQuestion, redeem, bookings, matched } = useRung();
  const [pickedMentor, setPickedMentor] = useState("riya");
  const [toast, setToast] = useState<string | null>(null);

  const industry = people.filter((p) => p.role === "industry");
  const faculty = people.filter((p) => p.role === "faculty");
  const peerGuides = people.filter(
    (p) => p.role === "student" && p.id !== "you",
  );

  const recs = useMemo(() => {
    if (!question.trim()) return [];
    return mentorsForQuestion(question).slice(0, 4);
  }, [question]);

  function buy(shopItemId: string, cost: number, minutes: number) {
    const ok = redeem(shopItemId, pickedMentor, cost, minutes);
    setToast(
      ok
        ? `Booked ${minutes} min with ${personById(pickedMentor).name}`
        : `Need ${cost} pts — you have ${points}`,
    );
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="px-5 pt-4 pb-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-rung-mute">
        Mentors
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-rung-fg">
        Guides & shop
      </h1>
      <p className="mt-1.5 text-sm text-rung-mute">
        Peers and faculty free. Industry minutes cost points.
      </p>

      <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white p-4">
        <label className="flex items-center gap-2 text-xs font-medium text-rung-mute">
          <Search className="size-3.5" />
          Who should I ask about…
        </label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="ROS, resume, scope cuts…"
          className="mt-2 w-full rounded-xl bg-[#fffcf5] px-3 py-2.5 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-[#e5ccff]"
        />
        {recs.length > 0 && (
          <ul className="mt-3 space-y-2">
            {recs.map(({ person }) => (
              <li
                key={person.id}
                className="flex items-center gap-3 rounded-xl bg-[#f6efff]/60 px-3 py-2"
              >
                <Avatar initials={person.avatar} role={person.role} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-rung-fg">
                    {person.name}
                  </p>
                  <p className="truncate text-xs text-rung-mute">
                    {person.helpTopics.slice(0, 2).join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Section title="Peers">
        <PeopleRow people={peerGuides} highlightIds={matched} />
      </Section>
      <Section title="Faculty">
        <PeopleRow people={faculty} />
      </Section>
      <Section title="Industry shop">
        <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {industry.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPickedMentor(p.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                pickedMentor === p.id
                  ? "border-[#e5ccff] bg-[#f6efff] text-rung-fg"
                  : "border-black/[0.08] bg-white text-rung-mute",
              )}
            >
              <Avatar initials={p.avatar} role={p.role} size="sm" />
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <p className="mb-3 text-xs text-rung-mute">
          ~1 pt ≈ 1 minute · or use a bundle
        </p>
        <ul className="space-y-3">
          {shopItems.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-rung-fg">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-rung-mute">
                    {item.description}
                  </p>
                </div>
                <p className="text-lg font-semibold tabular-nums text-rung-fg">
                  {item.points}
                  <span className="block text-[10px] font-normal text-rung-mute">
                    pts
                  </span>
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-rung-mute">
                  <Clock className="size-3.5" />
                  {item.minutes} min · {personById(pickedMentor).name}
                </span>
                <button
                  type="button"
                  onClick={() => buy(item.id, item.points, item.minutes)}
                  className="rounded-full bg-[#e5ccff] px-3 py-1.5 text-xs font-semibold text-rung-fg"
                >
                  Redeem
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {bookings.length > 0 && (
        <Section title="Bookings">
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="rounded-xl bg-[#f6efff] px-3 py-2.5 text-sm text-rung-fg"
              >
                {b.minutes} min · {personById(b.mentorId).name} · −
                {b.pointsSpent} pts
              </li>
            ))}
          </ul>
        </Section>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#e5ccff] px-4 py-2 text-sm font-medium text-rung-fg shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold text-rung-fg">{title}</h2>
      {children}
    </section>
  );
}

function PeopleRow({
  people: list,
  highlightIds = [],
}: {
  people: typeof people;
  highlightIds?: string[];
}) {
  return (
    <ul className="space-y-2">
      {list.map((p) => (
        <li
          key={p.id}
          className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-3 py-3"
        >
          <Avatar initials={p.avatar} role={p.role} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-rung-fg">
              {p.name}
              {highlightIds.includes(p.id) && (
                <span className="ml-2 text-[10px] uppercase text-rung-ember">
                  matched
                </span>
              )}
            </p>
            <p className="truncate text-xs text-rung-mute">
              {p.helpTopics.join(" · ")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
