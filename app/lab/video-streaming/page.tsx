import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import VideoStreaming from "@/components/lab/VideoStreaming";
import { getEntry } from "@/lib/lab";

const entry = getEntry("video-streaming")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <VideoStreaming />
    </LabShell>
  );
}
