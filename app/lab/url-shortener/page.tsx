import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";
import UrlShortener from "@/components/lab/UrlShortener";
import { getEntry } from "@/lib/lab";

const entry = getEntry("url-shortener")!;

export const metadata: Metadata = {
  title: `${entry.title} - The Lab · Yasir Khalid`,
  description: entry.blurb,
};

export default function Page() {
  return (
    <LabShell entry={entry}>
      <UrlShortener />
    </LabShell>
  );
}
