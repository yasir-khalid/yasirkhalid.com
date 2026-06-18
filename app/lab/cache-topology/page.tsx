import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import CacheTopology from "@/components/lab/CacheTopology";
import { getEntry } from "@/lib/lab";

const entry = getEntry("cache-topology")!;

export const metadata: Metadata = {
  title: `${entry.title} — The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <CacheTopology />
    </LabShell>
  );
}
