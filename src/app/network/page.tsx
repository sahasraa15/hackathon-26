"use client";

import { useMemo, useState } from "react";
import {
  colleges,
  filterPeopleByCollege,
  matchCards,
  peopleYouMightKnow,
  personById,
  researchOpps,
  sameMajorFamily,
} from "@/lib/rung-data";
import { useRung } from "@/lib/rung-store";
import { Avatar } from "@/components/rung/Avatar";
import { HotspotProject } from "@/components/rung/HotspotProject";
import { cn } from "@/lib/utils";

export default function NetworkPage() {
  const {
    you,
    collegeFilter,
    setCollegeFilter,
    sendMessage,
    messages,
    matched,
    session,
    setQuestion,
    myMajor,
    majorOnly,
    exploreMajors,
  } = useRung();
  const [dmTo, setDmTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState<string | null>("kai");

  const directory = useMemo(
    () => filterPeopleByCollege(collegeFilter).slice(0, 12),
    [collegeFilter],
  );
  const pymk = useMemo(
    () => peopleYouMightKnow(you.college, you.id).slice(0, 5),
    [you.college, you.id],
  );

  const research = useMemo(() => {
    return researchOpps
      .filter((r) => collegeFilter === "all" || r.college === collegeFilter)
      .slice(0, 3);
  }, [collegeFilter]);

  const hotspotPeople = useMemo(
    () =>
      matchCards.filter((c) => {
        if (!c.projectImage || !c.hotspots?.length) return false;
        const p = personById(c.personId);
        if (
          collegeFilter !== "all" &&
          p.college !== collegeFilter
        ) {
          return false;
        }
        if (
          majorOnly &&
          !sameMajorFamily(p.major, myMajor, exploreMajors)
        )
          return false;
        return true;
      }),
    [collegeFilter, majorOnly, myMajor, exploreMajors],
  );

  return (
    <div className="px-5 pt-4 pb-10">
      <h1 className="text-xl font-semibold tracking-tight text-rung-fg">
        People
      </h1>

      <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none">
        <Chip
          active={collegeFilter === "all"}
          onClick={() => setCollegeFilter("all")}
          label="All"
        />
        {colleges.map((c) => (
          <Chip
            key={c}
            active={collegeFilter === c}
            onClick={() => setCollegeFilter(c)}
            label={c}
          />
        ))}
      </div>

      {hotspotPeople.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-rung-fg">
            Project walkthroughs
          </h2>
          <p className="mt-0.5 text-xs text-rung-mute">
            Tap glowing dots · draft a DM from a hotspot
          </p>
          <ul className="mt-3 space-y-3">
            {hotspotPeople.map((card) => {
              const p = personById(card.personId);
              const open = expanded === card.personId;
              return (
                <li
                  key={card.id}
                  className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(open ? null : card.personId)
                    }
                    className="flex w-full items-center gap-3 px-3 py-3 text-left"
                  >
                    <Avatar initials={p.avatar} role={p.role} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-rung-fg">
                        {p.name}
                      </p>
                      <p className="truncate text-xs text-rung-mute">
                        {card.headline} · {p.major || p.company}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-rung-ember">
                      {open ? "Hide" : "Open"}
                    </span>
                  </button>
                  {open && card.projectImage && card.hotspots && (
                    <div className="border-t border-black/[0.05] p-3 pt-2">
                      <HotspotProject
                        image={card.projectImage}
                        hotspots={card.hotspots}
                        onAsk={(prompt) => {
                          sendMessage(card.personId, prompt);
                          setQuestion(prompt);
                          setDmTo(card.personId);
                          setDraft(prompt);
                        }}
                      />
                      {dmTo === card.personId && (
                        <form
                          className="mt-3 flex gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage(card.personId, draft);
                            setDraft("");
                            setDmTo(null);
                          }}
                        >
                          <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            className="flex-1 rounded-full bg-[#fffcf0] px-3 py-2 text-sm outline-none ring-1 ring-black/[0.06]"
                          />
                          <button
                            type="submit"
                            className="rounded-full bg-[#e5ccff] px-3 py-2 text-xs font-semibold"
                          >
                            Send
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-rung-fg">
          Might know · {you.college}
        </h2>
        <ul className="mt-3 space-y-2">
          {pymk.map((p) => (
            <PersonRow
              key={p.id}
              name={p.name}
              avatar={p.avatar}
              role={p.role}
              meta={`${p.major || p.company || p.affiliation}${matched.includes(p.id) ? " · matched" : ""}`}
              onOpen={() => setExpanded(p.id)}
            />
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-rung-fg">Directory</h2>
        <ul className="mt-3 space-y-2">
          {directory.map((p) => (
            <PersonRow
              key={p.id}
              name={p.name}
              avatar={p.avatar}
              role={p.role}
              meta={`${p.college} · ${p.major || p.company || p.affiliation}`}
            />
          ))}
        </ul>
      </section>

      {session === "student" && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-rung-fg">Research</h2>
          <ul className="mt-3 space-y-3">
            {research.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-black/[0.06] bg-white p-4"
              >
                <p className="text-xs text-rung-ember">{r.lab}</p>
                <p className="mt-0.5 font-semibold text-rung-fg">{r.title}</p>
                {dmTo === r.contactId ? (
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(r.contactId, draft);
                      setDraft("");
                      setDmTo(null);
                    }}
                  >
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Hi…"
                      className="flex-1 rounded-full bg-[#fffcf0] px-3 py-2 text-sm outline-none ring-1 ring-black/[0.06]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-[#e5ccff] px-3 py-2 text-xs font-semibold"
                    >
                      Send
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDmTo(r.contactId)}
                    className="mt-3 rounded-full bg-[#e5ccff] px-3 py-1.5 text-xs font-semibold"
                  >
                    Message
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {messages.length > 0 && (
        <p className="mt-6 text-xs text-rung-mute">
          {messages.length} message{messages.length === 1 ? "" : "s"} sent
        </p>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
        active
          ? "bg-[#e5ccff] text-rung-fg"
          : "bg-white text-rung-mute ring-1 ring-black/[0.06]",
      )}
    >
      {label}
    </button>
  );
}

function PersonRow({
  name,
  avatar,
  role,
  meta,
  onOpen,
}: {
  name: string;
  avatar: string;
  role: "student" | "faculty" | "industry";
  meta: string;
  onOpen?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className="flex w-full items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 text-left disabled:cursor-default"
      >
        <Avatar initials={avatar} role={role} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-rung-fg">{name}</p>
          <p className="truncate text-xs text-rung-mute">{meta}</p>
        </div>
      </button>
    </li>
  );
}
