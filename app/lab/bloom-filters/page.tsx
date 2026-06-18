import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import BloomFilter from "@/components/lab/BloomFilter";
import { getEntry } from "@/lib/lab";

const entry = getEntry("bloom-filters")!;

export const metadata: Metadata = {
  title: `${entry.title} — The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <BloomFilter />
    </LabShell>
  );
}
