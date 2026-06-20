import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import NewsFeed from "@/components/lab/NewsFeed";
import { getEntry } from "@/lib/lab";

const entry = getEntry("news-feed")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <NewsFeed />
    </LabShell>
  );
}
