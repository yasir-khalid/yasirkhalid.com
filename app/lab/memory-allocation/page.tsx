import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import MemoryAllocation from "@/components/lab/MemoryAllocation";
import { getEntry } from "@/lib/lab";

const entry = getEntry("memory-allocation")!;

export const metadata: Metadata = {
  title: `${entry.title} — The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <MemoryAllocation />
    </LabShell>
  );
}
