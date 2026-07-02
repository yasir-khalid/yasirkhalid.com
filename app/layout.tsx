import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Fraunces = open-source substitute for fin.ai's custom "Serrif" display face -
// a light-weight serif with tight negative tracking at large sizes.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

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
  title: "Yasir Khalid - AI Engineer",
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
    title: "Yasir Khalid - AI Engineer",
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
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
