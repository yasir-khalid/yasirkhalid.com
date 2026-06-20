import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import WebCrawler from "@/components/lab/WebCrawler";
import { getEntry } from "@/lib/lab";

const entry = getEntry("web-crawler")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <WebCrawler />
    </LabShell>
  );
}
