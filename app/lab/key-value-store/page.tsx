import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import KeyValueStore from "@/components/lab/KeyValueStore";
import { getEntry } from "@/lib/lab";

const entry = getEntry("key-value-store")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <KeyValueStore />
    </LabShell>
  );
}
