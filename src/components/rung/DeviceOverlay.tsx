"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Full-bleed overlay clipped to the iPhone device frame. */
export function DeviceOverlay({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [host, setHost] = useState<Element | null>(null);

  useEffect(() => {
    setHost(document.querySelector(".app-device"));
  }, []);

  if (!host) return null;

  return createPortal(
    <div className={`absolute inset-0 z-[70] ${className}`}>{children}</div>,
    host,
  );
}
