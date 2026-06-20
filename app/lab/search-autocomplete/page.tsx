import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import Autocomplete from "@/components/lab/Autocomplete";
import { getEntry } from "@/lib/lab";

const entry = getEntry("search-autocomplete")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <Autocomplete />
    </LabShell>
  );
}
