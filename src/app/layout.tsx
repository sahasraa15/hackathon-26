import type { Metadata, Viewport } from "next";
import { Nunito, Sora, JetBrains_Mono } from "next/font/google";
import { RungProvider } from "@/lib/rung-store";
import { AppShell } from "@/components/rung/AppShell";
import "./globals.css";

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const display = Sora({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
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
  themeColor: "#fbf8ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="font-body text-rung-fg">
        <RungProvider>
          <AppShell>{children}</AppShell>
        </RungProvider>
      </body>
    </html>
  );
}
