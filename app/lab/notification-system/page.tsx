import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import NotificationSystem from "@/components/lab/NotificationSystem";
import { getEntry } from "@/lib/lab";

const entry = getEntry("notification-system")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <NotificationSystem />
    </LabShell>
  );
}
