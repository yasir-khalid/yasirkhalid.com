import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import DistributedCaching from "@/components/lab/DistributedCaching";
import { getEntry } from "@/lib/lab";

const entry = getEntry("distributed-caching")!;

export const metadata: Metadata = {
  title: `${entry.title} — The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <DistributedCaching />
    </LabShell>
  );
}
