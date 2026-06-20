import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import SnowflakeId from "@/components/lab/SnowflakeId";
import { getEntry } from "@/lib/lab";

const entry = getEntry("unique-id-generator")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <SnowflakeId />
    </LabShell>
  );
}
