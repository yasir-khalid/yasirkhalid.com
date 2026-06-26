import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import HashingLab from "@/components/lab/HashingLab";
import { getEntry } from "@/lib/lab";

const entry = getEntry("hashing")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <HashingLab />
    </LabShell>
  );
}
