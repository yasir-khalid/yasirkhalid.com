import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import Caching from "@/components/lab/Caching";
import { getEntry } from "@/lib/lab";

const entry = getEntry("caching-strategies")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <Caching />
    </LabShell>
  );
}
