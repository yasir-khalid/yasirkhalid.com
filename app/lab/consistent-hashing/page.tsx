import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import ConsistentHashing from "@/components/lab/ConsistentHashing";
import { getEntry } from "@/lib/lab";

const entry = getEntry("consistent-hashing")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <ConsistentHashing />
    </LabShell>
  );
}
