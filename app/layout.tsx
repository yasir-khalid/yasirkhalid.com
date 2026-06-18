import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Haas Groot Disp / Haas Grotesk substitute → Inter (Inter Display) for both
// display and text. Mono retained for data/code surfaces (the lab).
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yasirkhalid.dev"),
  title: "Yasir Khalid — AI Engineer",
  description:
    "AI engineer building production agent systems in regulated enterprise. Lead Developer at HSBC, owning a multi-agent platform serving 15,000+ users across 100+ jurisdictions.",
  keywords: [
    "AI Engineer",
    "Agentic AI",
    "LLMOps",
    "Google ADK",
    "MCP",
    "OpenTelemetry",
    "Yasir Khalid",
  ],
  authors: [{ name: "Yasir Khalid" }],
  openGraph: {
    title: "Yasir Khalid — AI Engineer",
    description:
      "Building production agent systems in regulated enterprise. Lead Developer at HSBC.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
