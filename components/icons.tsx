// Monochrome brand glyphs - currentColor so they inherit text colour.
// Used as `social-icon`: on-dark-mute → on-dark in dark regions,
// charcoal → ink on light. See DESIGN.md.
import type { ReactElement } from "react";

export function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

export function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

// --- Latency category glyphs (stroke, currentColor) ---

export function ChipIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 2.5v3M14 2.5v3M10 18.5v3M14 18.5v3M2.5 10h3M2.5 14h3M18.5 10h3M18.5 14h3" />
    </svg>
  );
}

export function MemoryIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="10" rx="1.5" />
      <path d="M7 17v3M12 17v3M17 17v3M8 10.5v3M12 10.5v3M16 10.5v3" />
    </svg>
  );
}

export function StorageIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </svg>
  );
}

export function NetworkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21M12 3C9.5 5.5 8.2 8.7 8.2 12S9.5 18.5 12 21" />
    </svg>
  );
}

export function ActivityIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12h4l3-8 5 16 3-8h4" />
    </svg>
  );
}

export function ServerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="7" rx="1.6" />
      <rect x="3" y="13" width="18" height="7" rx="1.6" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </svg>
  );
}

export function BoltIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

export function DatabaseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v13c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-13" />
      <path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3" />
    </svg>
  );
}

export function DriveIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="16.5" cy="12" r="1.6" />
      <path d="M6.5 12h5" />
    </svg>
  );
}

export function ListIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
}

export function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function EmailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 6 9 6 9-6" />
    </svg>
  );
}

export function BinaryIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3.5" width="7" height="7" rx="1" />
      <rect x="14" y="13.5" width="7" height="7" rx="1" />
      <path d="M16 3.5h1.5v7M16 10.5h3M6 13.5H4.5v7M4.5 20.5h3" />
    </svg>
  );
}

export function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-6L12 2.5Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

// --- Lab concept glyphs (stroke, currentColor) - one per explainer ---
// Used on the /lab gallery cards. Same line-icon language as the latency
// glyphs: 24x24, 1.7 stroke, rounded caps/joins.

function BloomIcon({ className = "" }: { className?: string }) {
  // a bit array with a few bits flipped on
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="8.5" width="19" height="7" rx="1.5" />
      <path d="M6.2 8.5v7M9.9 8.5v7M13.6 8.5v7M17.3 8.5v7" />
      <rect x="2.9" y="8.9" width="3" height="6.2" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="10.3" y="8.9" width="3" height="6.2" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="17.7" y="8.9" width="3" height="6.2" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HashingIcon({ className = "" }: { className?: string }) {
  // a key fanning into buckets
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3.5 7.5 20.5M16.5 3.5 15 20.5M4 9h16M3.5 15h16" />
    </svg>
  );
}

function LoadBalanceIcon({ className = "" }: { className?: string }) {
  // one source fanning out to three servers
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 6.5v3M12 9.5h-7v2.5M12 9.5h7v2.5M12 9.5v2.5" />
      <rect x="2.5" y="14.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="14.5" width="5" height="5" rx="1" />
      <rect x="16.5" y="14.5" width="5" height="5" rx="1" />
    </svg>
  );
}

function BigOIcon({ className = "" }: { className?: string }) {
  // axes with an exploding growth curve
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3v17h17" />
      <path d="M5 19c5-.5 8.5-3 10.5-7.5C17 8 18.5 5.5 20 4" />
    </svg>
  );
}

function MathIcon({ className = "" }: { className?: string }) {
  // back-of-the-envelope calculator
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="2.5" width="15" height="19" rx="2" />
      <path d="M7.5 6.5h9" />
      <path d="M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

function CacheIcon({ className = "" }: { className?: string }) {
  // a fast-path bolt over a store
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 6.5c0-1.5 3.8-2.5 8.5-2.5s8.5 1 8.5 2.5-3.8 2.5-8.5 2.5S3.5 8 3.5 6.5Z" />
      <path d="M3.5 6.5v11c0 1.5 3.8 2.5 8.5 2.5" />
      <path d="M20.5 6.5v4.5" />
      <path d="m17 13-3.5 4h3l-1 3.5 4-4.5h-3l1-3Z" />
    </svg>
  );
}

function DistributedCacheIcon({ className = "" }: { className?: string }) {
  // nodes around a shared centre
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 5.5v4M12 14.5v4M5.7 8.5l3.8 2.2M14.5 12.8l3.8 2.2M5.7 15.5l3.8-2.2M14.5 11.2l3.8-2.2" />
      <circle cx="12" cy="3.5" r="1.6" />
      <circle cx="12" cy="20.5" r="1.6" />
      <circle cx="4" cy="7.5" r="1.6" />
      <circle cx="20" cy="7.5" r="1.6" />
      <circle cx="4" cy="16.5" r="1.6" />
      <circle cx="20" cy="16.5" r="1.6" />
    </svg>
  );
}

function QueueIcon({ className = "" }: { className?: string }) {
  // a line of items draining right
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="8" width="3.5" height="8" rx="1" />
      <rect x="7.5" y="8" width="3.5" height="8" rx="1" />
      <rect x="12.5" y="8" width="3.5" height="8" rx="1" />
      <path d="M18.5 12h3M19.5 9.5 22 12l-2.5 2.5" />
    </svg>
  );
}

function RetryIcon({ className = "" }: { className?: string }) {
  // a retry loop
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 5.5v5h-5" />
      <path d="M19.2 10.5A8 8 0 1 0 20 15" />
    </svg>
  );
}

function EvolutionIcon({ className = "" }: { className?: string }) {
  // rising stages
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="15.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="10.5" width="5" height="10" rx="1" />
      <rect x="16.5" y="4.5" width="5" height="16" rx="1" />
    </svg>
  );
}

function RingIcon({ className = "" }: { className?: string }) {
  // a hash ring with nodes placed around it
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="4.5" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="14.5" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="6" cy="16" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GaugeIcon({ className = "" }: { className?: string }) {
  // a throttle gauge
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18 16 9.5" />
      <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IdIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M7 9.5v5M10 9.5v5M13.5 9.5v5M17 9.5v5" />
    </svg>
  );
}

function LinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M8 11 6 13a3.5 3.5 0 0 0 5 5l2-2" />
      <path d="M16 13l2-2a3.5 3.5 0 0 0-5-5l-2 2" />
    </svg>
  );
}

function KeyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="4" />
      <path d="m11 11 8 8M16 16l2-2M14.5 14.5 17 12" />
    </svg>
  );
}

function CrawlerIcon({ className = "" }: { className?: string }) {
  // linked nodes - a crawl graph
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="9" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M6.7 7.3 10.5 16.5M13.8 16.8 17.6 10.4M6.8 6.4 17 8.5" />
    </svg>
  );
}

function BellIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2.5 2.5 0 0 0 4 0" />
    </svg>
  );
}

function FeedIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4" width="17" height="6" rx="1.5" />
      <path d="M3.5 13.5h12M3.5 17h17M3.5 20.5h9" />
    </svg>
  );
}

function ChatIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5h16v11H9l-4 3.5v-3.5H4Z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5M8 10.5h5M8 13h3" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m10 9.5 5 2.5-5 2.5Z" fill="currentColor" />
    </svg>
  );
}

function FolderSyncIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.5h7A1.5 1.5 0 0 1 19 9" />
      <path d="M3 6.5V17a1.5 1.5 0 0 0 1.5 1.5h9" />
      <path d="M18 13v3h-3M21 19v-3h-3" />
      <path d="M18.5 16a2.8 2.8 0 0 1 2.3-1.2M20.5 16a2.8 2.8 0 0 1-2.3 1.2" />
    </svg>
  );
}

function ProximityIcon({ className = "" }: { className?: string }) {
  // a grid with a location pin dropped on it - spatial indexing
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 4.5h17v17h-17Z" />
      <path d="M9 4.5v17M15 4.5v17M3.5 10h17M3.5 15.5h17" />
      <path d="M12 7.5a2.6 2.6 0 0 1 2.6 2.6c0 1.9-2.6 4.4-2.6 4.4s-2.6-2.5-2.6-4.4A2.6 2.6 0 0 1 12 7.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NearbyFriendsIcon({ className = "" }: { className?: string }) {
  // a person at the centre of a radar ping with nearby dots
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="6.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="17.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Lookup by lab slug. Falls back are handled by the caller.
export const labIcons: Record<
  string,
  ({ className }: { className?: string }) => ReactElement
> = {
  "bloom-filters": BloomIcon,
  hashing: HashingIcon,
  "load-balancing": LoadBalanceIcon,
  "big-o": BigOIcon,
  "system-design-math": MathIcon,
  "caching-strategies": CacheIcon,
  "distributed-caching": DistributedCacheIcon,
  queueing: QueueIcon,
  retries: RetryIcon,
  "system-evolution": EvolutionIcon,
  "consistent-hashing": RingIcon,
  "rate-limiter": GaugeIcon,
  "unique-id-generator": IdIcon,
  "url-shortener": LinkIcon,
  "key-value-store": KeyIcon,
  "web-crawler": CrawlerIcon,
  "notification-system": BellIcon,
  "news-feed": FeedIcon,
  "chat-system": ChatIcon,
  "search-autocomplete": SearchIcon,
  "video-streaming": PlayIcon,
  "file-storage": FolderSyncIcon,
  "proximity-service": ProximityIcon,
  "nearby-friends": NearbyFriendsIcon,
};
