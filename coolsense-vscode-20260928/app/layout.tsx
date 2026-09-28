import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoolSense SUSS — Energy Command Centre",
  description: "A data-led smart zoning proposal for the UOB–SUSS Planet Resilience Hackathon.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
