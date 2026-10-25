"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  Eye,
  Heart,
  MessageSquare,
  Play,
  Reply,
} from "lucide-react";
import { demos } from "@/lib/rung-data";
import { useRung, type InboxItem } from "@/lib/rung-store";

const copy: Record<
  InboxItem["kind"],
  {
    icon: typeof Eye;
    headline: (name: string) => string;
    unit?: string;
    href: string;
  }
> = {
  feedback: {
    icon: MessageSquare,
    headline: (n) => `${n} left feedback`,
    unit: "pts",
    href: "/my-projects",
  },
  view: {
    icon: Eye,
    headline: (n) => `${n} viewed your project`,
    href: "/my-projects",
  },
  try: {
    icon: Play,
    headline: (n) => `${n} tried your prototype`,
    href: "/my-projects",
  },
  helpful: {
    icon: Heart,
    headline: (n) => `${n} found your note helpful`,
    unit: "credits",
    href: "/pro/ladder",
  },
  reply: {
    icon: Reply,
    headline: (n) => `${n} replied to your note`,
    href: "/pro/feedback",
  },
  accepted: {
    icon: CalendarCheck,
    headline: (n) => `${n} accepted your ask`,
    href: "/pro/ladder",
  },
};

/** Pops in when the other window (student ↔ pro) does something that involves you. */
export function BridgeToast() {
  const { inbox, dismissInbox } = useRung();
  const router = useRouter();
  const item = inbox[0];

  useEffect(() => {
    if (!item) return;
    const t = setTimeout(() => dismissInbox(item.id), 6000);
    return () => clearTimeout(t);
  }, [item, dismissInbox]);

  const c = item ? copy[item.kind] : null;
  const demoTitle = item?.demoId
    ? demos.find((d) => d.id === item.demoId)?.title
    : undefined;
  const quote =
    item &&
    (item.kind === "feedback" ||
      item.kind === "helpful" ||
      item.kind === "reply");

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-50 sm:top-14">
      <AnimatePresence>
        {item && c && (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => {
              dismissInbox(item.id);
              router.push(c.href);
            }}
            initial={{ y: -80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-black/[0.06] bg-white p-3.5 text-left shadow-[0_12px_32px_rgb(42_36_56/0.18)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ffe2c5]">
              <c.icon className="size-4 text-rung-fg" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-rung-fg">
                {c.headline(item.fromName)}
              </span>
              <span className="block truncate text-xs text-rung-mute">
                {quote ? demoTitle : item.text || demoTitle}
              </span>
              {quote && item.text && (
                <span className="mt-1 line-clamp-2 block text-sm text-rung-fg">
                  “{item.text}”
                </span>
              )}
            </span>
            {item.reward && (
              <motion.span
                initial={{ scale: 0.4 }}
                animate={{ scale: [0.4, 1.25, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="shrink-0 rounded-full bg-[#e5ccff] px-2 py-1 text-center text-xs font-semibold leading-tight text-rung-fg"
              >
                {item.reward}
                <span className="block text-[9px] font-medium text-rung-mute">
                  {c.unit}
                </span>
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
