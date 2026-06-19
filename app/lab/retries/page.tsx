import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import Retries from "@/components/lab/Retries";
import { getEntry } from "@/lib/lab";

const entry = getEntry("retries")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <Retries />
    </LabShell>
  );
}
