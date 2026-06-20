import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import RateLimiter from "@/components/lab/RateLimiter";
import { getEntry } from "@/lib/lab";

const entry = getEntry("rate-limiter")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <RateLimiter />
    </LabShell>
  );
}
