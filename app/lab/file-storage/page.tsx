import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import FileStorage from "@/components/lab/FileStorage";
import { getEntry } from "@/lib/lab";

const entry = getEntry("file-storage")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <FileStorage />
    </LabShell>
  );
}
