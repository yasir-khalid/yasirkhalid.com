import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import SystemEvolution from "@/components/lab/SystemEvolution";
import { getEntry } from "@/lib/lab";

const entry = getEntry("system-evolution")!;

export const metadata: Metadata = {
  title: `${entry.title} — The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <SystemEvolution />
    </LabShell>
  );
}
