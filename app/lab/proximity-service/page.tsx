import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import ProximityService from "@/components/lab/ProximityService";
import { getEntry } from "@/lib/lab";

const entry = getEntry("proximity-service")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry} wide>
      <ProximityService />
    </LabShell>
  );
}
