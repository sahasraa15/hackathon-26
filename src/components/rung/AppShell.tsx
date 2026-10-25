"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Clapperboard,
  Compass,
  Home,
  Layers,
  MessageSquare,
  Sparkles,
  Users,
  UserRound,
  Bell,
  ChevronsUp,
  Coins,
} from "lucide-react";
import { useRung } from "@/lib/rung-store";
import { YOU_ID } from "@/lib/rung-data";
import { HelpChat } from "@/components/rung/HelpChat";
import { cn } from "@/lib/utils";
import { BridgeToast } from "@/components/rung/BridgeToast";

const studentTabs = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/match", label: "Match", icon: Compass },
  { href: "/network", label: "Network", icon: Users },
  { href: "/profile", label: "You", icon: UserRound },
] as const;

const proTabs = [
  { href: "/pro", label: "Home", icon: Briefcase },
  { href: "/pro/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/pro/ladder", label: "Ladder", icon: ChevronsUp },
  { href: "/network", label: "Network", icon: Users },
  { href: "/profile", label: "You", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    points,
    tier,
    session,
    hydrated,
    myMajor,
    credits,
    demos,
    comments,
    seenFeedback,
  } = useRung();
  const myDemoIds = new Set(
    demos.filter((d) => d.authorId === YOU_ID).map((d) => d.id),
  );
  const unread = comments.filter(
    (c) => myDemoIds.has(c.demoId) && !seenFeedback.includes(c.id),
  ).length;
  const isLogin = pathname.startsWith("/login");
  const isReels = pathname.startsWith("/reels");

  useEffect(() => {
    if (!hydrated) return;
    if (!session && !isLogin) router.replace("/login");
    if (session && isLogin) {
      router.replace(session === "professional" ? "/pro" : "/");
    }
  }, [hydrated, session, isLogin, router]);

  if (isLogin) {
    return (
      <div className="app-device text-rung-fg">
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    );
  }

  if (!hydrated || !session) {
    return (
      <div className="app-device flex items-center justify-center text-sm text-rung-mute">
        Loading…
      </div>
    );
  }

  const tabs = session === "professional" ? proTabs : studentTabs;

  return (
    <div className="app-device text-rung-fg">
      {!isReels && (
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-black/[0.06] bg-[#fffcf0]/90 px-5 pb-3.5 pt-[max(0.85rem,env(safe-area-inset-top))] backdrop-blur-md sm:pt-14">
          <Link
            href={session === "professional" ? "/pro" : "/"}
            className="min-w-0"
          >
            <p className="text-base font-semibold tracking-tight text-rung-fg">
              CollegeConnectors
            </p>
            <p className="mt-0.5 truncate text-[11px] text-rung-mute">
              {session === "student" ? myMajor : "Pro"} · {tier.name}
            </p>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/tiers"
              className="flex items-center gap-1 rounded-full border border-black/[0.06] bg-white px-2.5 py-1.5 text-[11px] font-medium text-rung-fg"
            >
              <Layers className="size-3.5 text-rung-ember" />
              {tier.name}
            </Link>
            {session === "student" && (
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-sm">
                <span className="size-1.5 rounded-full bg-[#e5ccff]" />
                <span className="font-semibold tabular-nums">{points}</span>
              </div>
            )}
            {session === "professional" && (
              <Link
                href="/pro/ladder"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-sm"
                aria-label={`${credits} mentor credits`}
              >
                <Coins className="size-3.5 text-rung-ember" />
                <span className="font-semibold tabular-nums">{credits}</span>
              </Link>
            )}
            {session === "student" && (
              <Link
                href="/my-projects"
                className="relative rounded-full p-1.5 text-rung-mute"
                aria-label={
                  unread ? `My projects, ${unread} new notes` : "My projects"
                }
              >
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-rung-ember text-[9px] font-semibold text-white tabular-nums">
                    {unread}
                  </span>
                )}
              </Link>
            )}
            {session === "student" && (
              <Link
                href="/projects"
                className="rounded-full p-1.5 text-rung-mute"
                aria-label="Projects"
              >
                <Sparkles className="size-4" />
              </Link>
            )}
          </div>
        </header>
      )}

      <div
        className={cn(
          "relative flex-1 overscroll-contain",
          isReels ? "overflow-hidden pb-[4.25rem]" : "overflow-y-auto pb-24",
        )}
      >
        {children}
        {!isReels && <HelpChat />}
      </div>

      <BridgeToast />

      <nav
        className={cn(
          "absolute bottom-0 left-0 right-0 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5",
          isReels
            ? "border-t border-white/10 bg-black/50 backdrop-blur-md"
            : "border-t border-black/[0.06] bg-[#fffcf0]/95 backdrop-blur-md",
        )}
      >
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" || href === "/pro"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium",
                    isReels
                      ? active
                        ? "text-white"
                        : "text-white/55"
                      : active
                        ? "text-rung-ember"
                        : "text-rung-mute",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
