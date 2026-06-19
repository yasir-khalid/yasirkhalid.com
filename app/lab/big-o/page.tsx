import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import BigO from "@/components/lab/BigO";
import { getEntry } from "@/lib/lab";

const entry = getEntry("big-o")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <BigO />
    </LabShell>
  );
}
