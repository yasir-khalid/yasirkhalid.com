import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import LoadBalancing from "@/components/lab/LoadBalancing";
import { getEntry } from "@/lib/lab";

const entry = getEntry("load-balancing")!;

export const metadata: Metadata = {
  title: `${entry.title} — The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <LoadBalancing />
    </LabShell>
  );
}
