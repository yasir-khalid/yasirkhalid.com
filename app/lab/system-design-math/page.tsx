import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import SystemMath from "@/components/lab/SystemMath";
import { getEntry } from "@/lib/lab";

const entry = getEntry("system-design-math")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <SystemMath />
    </LabShell>
  );
}
