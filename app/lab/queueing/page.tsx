import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import Queueing from "@/components/lab/Queueing";
import { getEntry } from "@/lib/lab";

const entry = getEntry("queueing")!;

export const metadata: Metadata = {
  title: `${entry.title} — The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <Queueing />
    </LabShell>
  );
}
