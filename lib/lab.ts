// Registry for the interactive lab - visual, hands-on explainers of CS &
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
      "How keys get scattered into buckets - and what happens when two land in the same place. Tune the table size and watch collisions form chains.",
    kind: "essay",
    topic: "Data structures",
    tags: ["hash function", "collisions", "load factor"],
    status: "live",
  },
  {
    slug: "load-balancing",
    title: "Load balancing",
    blurb:
      "Send a stream of requests across a fleet of servers and compare strategies - round-robin, random, and least-connections - as the load piles up.",
    kind: "essay",
    topic: "Distributed systems",
    tags: ["round-robin", "least-conn", "fairness"],
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
      "Cache-aside, read-through, write-through, write-behind. Pick one, run traffic through it, and see the read path light up - and the database load drop.",
    kind: "tool",
    topic: "System design",
    tags: ["cache", "latency", "consistency"],
    status: "live",
  },
  {
    slug: "distributed-caching",
    title: "Local vs distributed caching",
    blurb:
      "Every pod keeps its own in-memory cache - fast, but they drift apart. Update the database, then watch local caches go stale while a shared Redis stays consistent. Invalidation, made visible.",
    kind: "tool",
    topic: "System design",
    tags: ["redis", "invalidation", "coherence"],
    status: "live",
  },
  {
    slug: "queueing",
    title: "Queueing",
    blurb:
      "Requests pile up faster than a server can drain them. Send traffic into FIFO, LIFO and priority queues, watch the line grow, and see tail latency explode as load approaches capacity.",
    kind: "essay",
    topic: "Distributed systems",
    tags: ["throughput", "backpressure", "p99"],
    status: "live",
  },
  {
    slug: "retries",
    title: "Retries",
    blurb:
      "Retrying a failed request seems harmless - until every client retries at once and buries a struggling service. Compare naive retries, fixed delay, exponential backoff and jitter, and watch the retry storm form (or not).",
    kind: "essay",
    topic: "Distributed systems",
    tags: ["backoff", "jitter", "retry storm"],
    status: "live",
  },
  {
    slug: "system-evolution",
    title: "System evolution",
    blurb:
      "Step a product from a single VM to a sharded, replicated architecture - splitting the DB, measuring before scaling, load-balancing, caching, moving slow work to queues, then replicas and shards. Each stage shows the bottleneck it fixes and the trade-off it brings.",
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
