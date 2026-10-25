"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Clapperboard,
  Compass,
  Home,
  MessageSquare,
  Settings,
  Users,
  UserRound,
} from "lucide-react";
import { useRung } from "@/lib/rung-store";
import { HelpChat } from "@/components/rung/HelpChat";
import { Tutorial } from "@/components/rung/Tutorial";
import { cn } from "@/lib/utils";

const studentTabs = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/match", label: "Match", icon: Compass },
  { href: "/network", label: "People", icon: Users },
  { href: "/profile", label: "You", icon: UserRound },
] as const;

const proTabs = [
  { href: "/pro", label: "Home", icon: Briefcase },
  { href: "/pro/sponsors", label: "Sponsors", icon: Building2 },
  { href: "/pro/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/network", label: "People", icon: Users },
  { href: "/profile", label: "You", icon: UserRound },
] as const;

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { points, tier, session, hydrated, myMajor, myCollege, contentScope } =
    useRung();
  const publicAuth =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isLanding = pathname === "/" && !session;
  const isReels = pathname.startsWith("/reels");
  const shellLess = publicAuth || isLanding;

  useEffect(() => {
    if (!hydrated) return;
    if (!session && !isPublicPath(pathname)) {
      router.replace("/");
      return;
    }
    if (session && publicAuth) {
      router.replace(session === "professional" ? "/pro" : "/");
    }
  }, [hydrated, session, pathname, publicAuth, router]);

  if (!hydrated) {
    return (
      <div className="app-device app-sunset flex items-center justify-center text-sm font-bold text-rung-mute">
        Warming up…
      </div>
    );
  }

  if (shellLess) {
    return <div className="app-device text-rung-fg">{children}</div>;
  }

  if (!session) {
    return (
      <div className="app-device app-sunset flex items-center justify-center text-sm font-bold text-rung-mute">
        Warming up…
      </div>
    );
  }

  const tabs = session === "professional" ? proTabs : studentTabs;
  const scopeLabel =
    contentScope === "major"
      ? myMajor
      : contentScope === "campus"
        ? myCollege
        : "All";

  return (
    <div className="app-device app-sunset text-rung-fg">
      {!isReels && (
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/40 bg-[#fbf8ff]/75 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] backdrop-blur-xl sm:pt-14">
          <Link
            href={session === "professional" ? "/pro" : "/"}
            className="min-w-0"
          >
            <p className="font-display text-[15px] font-extrabold tracking-tight text-rung-fg">
              College
              <span className="bg-gradient-to-r from-[#9b6bd6] to-[#2c1f3a] bg-clip-text text-transparent">
                Connectors
              </span>
            </p>
            <p className="mt-0.5 truncate text-[11px] font-bold text-rung-mute">
              {session === "student" ? scopeLabel : "Mentor"} · {tier.name}
            </p>
          </Link>
          <div className="flex items-center gap-2">
            {session === "student" && (
              <motion.div
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#fff59a] to-[#e4c4ff] px-3 py-1.5 text-xs font-extrabold text-rung-fg shadow-[0_6px_16px_rgba(155,107,214,0.18)]"
                whileTap={{ scale: 0.96 }}
              >
                {points}
                <span className="font-bold text-rung-fg/55">pts</span>
              </motion.div>
            )}
            <Link
              href="/settings"
              className="rounded-full bg-white/80 p-2.5 text-rung-fg shadow-sm ring-1 ring-white"
              aria-label="Settings"
            >
              <Settings className="size-4" />
            </Link>
          </div>
        </header>
      )}

      <div
        className={cn(
          "relative flex-1 overscroll-contain",
          isReels ? "overflow-hidden pb-[4.5rem]" : "overflow-y-auto pb-28",
        )}
      >
        {children}
        {!isReels && <HelpChat />}
        <Tutorial />
      </div>

      <nav
        className={cn(
          "absolute bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2",
          isReels && "border-t border-white/10 bg-black/55 backdrop-blur-xl",
        )}
      >
        <ul
          className={cn(
            "grid grid-cols-5 gap-0.5",
            !isReels &&
              "rounded-[1.6rem] bg-white/75 p-1.5 shadow-[0_12px_32px_rgba(80,40,60,0.12)] outline outline-1 outline-white/90 backdrop-blur-xl",
          )}
        >
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
                    "flex flex-col items-center gap-0.5 rounded-2xl px-0.5 py-1.5 text-[10px] font-extrabold transition",
                    isReels
                      ? active
                        ? "text-white"
                        : "text-white/50"
                      : active
                        ? "text-rung-fg"
                        : "text-rung-mute",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-2xl transition",
                      active &&
                        !isReels &&
                        "bg-gradient-to-br from-[#fff59a] to-[#e4c4ff] shadow-sm",
                      active && isReels && "bg-white/20",
                    )}
                  >
                    <Icon
                      className="size-[1.15rem]"
                      strokeWidth={active ? 2.4 : 1.85}
                    />
                  </span>
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
