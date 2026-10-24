import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { RungProvider } from "@/lib/rung-store";
import { AppShell } from "@/components/rung/AppShell";
import "./globals.css";

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CollegeConnectors",
    template: "%s · CollegeConnectors",
  },
  description:
    "CollegeConnectors — doomscroll demos, match with peers, earn points, unlock mentor minutes.",
  applicationName: "CollegeConnectors",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CollegeConnectors",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fffcf0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} h-full antialiased`}>
      <body className="font-body text-rung-fg">
        <RungProvider>
          <AppShell>{children}</AppShell>
        </RungProvider>
      </body>
    </html>
  );
}
