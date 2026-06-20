import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import ChatSystem from "@/components/lab/ChatSystem";
import { getEntry } from "@/lib/lab";

const entry = getEntry("chat-system")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <ChatSystem />
    </LabShell>
  );
}
