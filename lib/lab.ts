// Registry for the interactive lab — visual, hands-on explainers of CS &
// systems concepts. Inspired by samwho.dev (animated visual essays) and
// arjaythedev.com (interactive tools). Each entry maps to a route under /lab.

export type LabKind = "essay" | "tool";

export type LabEntry = {
  slug: string;
  title: string;
  blurb: string;
  /** "essay" = samwho-style animated walkthrough · "tool" = arjay-style sim */
  kind: LabKind;
  /** short taxonomy label shown on the card */
  topic: string;
  /** mono tags */
  tags: string[];
  /** built & live, or listed as upcoming */
  status: "live" | "soon";
};

export const lab: LabEntry[] = [
  {
    slug: "bloom-filters",
    title: "Bloom filters",
    blurb:
      "A probabilistic set that can tell you “definitely not” or “maybe”. Add words, watch the bits flip, and trip a false positive yourself.",
    kind: "essay",
    topic: "Data structures",
    tags: ["hashing", "probability", "bit array"],
    status: "live",
  },
  {
    slug: "hashing",
    title: "Hashing",
    blurb:
      "How keys get scattered into buckets — and what happens when two land in the same place. Tune the table size and watch collisions form chains.",
    kind: "essay",
    topic: "Data structures",
    tags: ["hash function", "collisions", "load factor"],
    status: "live",
  },
  {
    slug: "load-balancing",
    title: "Load balancing",
    blurb:
      "Send a stream of requests across a fleet of servers and compare strategies — round-robin, random, and least-connections — as the load piles up.",
    kind: "essay",
    topic: "Distributed systems",
    tags: ["round-robin", "least-conn", "fairness"],
    status: "live",
  },
  {
    slug: "queueing",
    title: "Queueing",
    blurb:
      "Work arrives faster than it's served and a line forms. Tune arrival rate, workers, and capacity, then watch wait time explode as utilization nears 100%.",
    kind: "essay",
    topic: "Distributed systems",
    tags: ["latency", "utilization", "little's law"],
    status: "live",
  },
  {
    slug: "retries",
    title: "Retries",
    blurb:
      "Retrying a failed request seems harmless — until an outage makes every client retry at once. Compare immediate, backoff, and jitter, and watch the retry storm form.",
    kind: "essay",
    topic: "Reliability",
    tags: ["backoff", "jitter", "thundering herd"],
    status: "live",
  },
  {
    slug: "memory-allocation",
    title: "Memory allocation",
    blurb:
      "malloc and free on a single row of memory. Allocate, free, and auto-churn to watch fragmentation creep in — free space that's there but unusable.",
    kind: "essay",
    topic: "Systems programming",
    tags: ["malloc", "fragmentation", "first-fit"],
    status: "live",
  },
  {
    slug: "big-o",
    title: "Big O notation",
    blurb:
      "Drag n and watch how each complexity class grows. The gap between O(log n) and O(n²) stops being abstract when you can see it explode.",
    kind: "essay",
    topic: "Algorithms",
    tags: ["complexity", "growth", "scaling"],
    status: "live",
  },
  {
    slug: "system-design-math",
    title: "System design math",
    blurb:
      "A back-of-the-envelope calculator. Set daily active users and watch it cascade into requests/sec, servers, storage, and a monthly bill.",
    kind: "tool",
    topic: "System design",
    tags: ["capacity", "estimation", "cost"],
    status: "live",
  },
  {
    slug: "caching-strategies",
    title: "Caching strategies",
    blurb:
      "Cache-aside, read-through, write-through, write-behind. Pick one, run traffic through it, and see the read path light up — and the database load drop.",
    kind: "tool",
    topic: "System design",
    tags: ["cache", "latency", "consistency"],
    status: "live",
  },
  {
    slug: "cache-topology",
    title: "Local vs distributed caching",
    blurb:
      "Where should the cache live? Give each pod its own, or share one Redis. Update a key and watch pods serve stale data — then fix it with TTL, pub/sub, or a shared cache.",
    kind: "tool",
    topic: "System design",
    tags: ["redis", "invalidation", "coherence"],
    status: "live",
  },
  {
    slug: "system-evolution",
    title: "System evolution",
    blurb:
      "Step a product from a single box to a distributed architecture. Each stage adds one piece and shows you the bottleneck it was added to fix.",
    kind: "tool",
    topic: "System design",
    tags: ["scaling", "architecture", "stages"],
    status: "live",
  },
];

export const liveLab = lab.filter((e) => e.status === "live");

export function getEntry(slug: string): LabEntry | undefined {
  return lab.find((e) => e.slug === slug);
}
