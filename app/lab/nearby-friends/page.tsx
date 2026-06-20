import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import NearbyFriends from "@/components/lab/NearbyFriends";
import { getEntry } from "@/lib/lab";

const entry = getEntry("nearby-friends")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry} wide>
      <NearbyFriends />
    </LabShell>
  );
}
