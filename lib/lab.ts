// Registry for the interactive lab - visual, hands-on explainers of CS &
// systems concepts. Inspired by samwho.dev (animated visual essays) and
// arjaythedev.com (interactive tools). Each entry maps to a route under /lab.

export type LabKind = "essay" | "tool";

/**
 * "concept" = a single CS / systems idea (the original explainers).
 * "design"  = a full "design X" walkthrough mapped from the system design
 *             interview canon (Alex Xu vol.1), shown in its own gallery band.
 */
export type LabGroup = "concept" | "design";

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
  /** which gallery band it belongs to (defaults to "concept") */
  group?: LabGroup;
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
  {
    slug: "consistent-hashing",
    title: "Consistent hashing",
    blurb:
      "Plain hash % N reshuffles almost every key when a server joins or leaves. Map servers and keys onto a ring instead, add virtual nodes, and watch only a thin slice of keys move - the trick behind Dynamo, Cassandra and every distributed cache.",
    kind: "tool",
    topic: "Distributed systems",
    tags: ["hash ring", "virtual nodes", "rebalancing"],
    status: "live",
  },

  // --- Example system designs (Alex Xu vol.1, ch.4-15) ---
  {
    slug: "rate-limiter",
    title: "Design a rate limiter",
    blurb:
      "Throttle a flood of requests four different ways - token bucket, leaking bucket, fixed window and sliding window. Open the tap, watch requests get accepted or 429'd in real time, and feel exactly where each algorithm leaks or bursts.",
    kind: "tool",
    topic: "System design",
    tags: ["token bucket", "429", "throttling"],
    status: "live",
    group: "design",
  },
  {
    slug: "unique-id-generator",
    title: "Design a unique ID generator",
    blurb:
      "Sortable, 64-bit IDs across thousands of machines with no coordination - the Snowflake layout of timestamp, machine ID and sequence bits.",
    kind: "tool",
    topic: "System design",
    tags: ["snowflake", "distributed", "64-bit"],
    status: "soon",
    group: "design",
  },
  {
    slug: "url-shortener",
    title: "Design a URL shortener",
    blurb:
      "Turn a long URL into a tiny one - base-62 encoding, hash collisions, and the read-heavy cache that makes the redirect instant.",
    kind: "tool",
    topic: "System design",
    tags: ["base62", "redirect", "read-heavy"],
    status: "soon",
    group: "design",
  },
  {
    slug: "key-value-store",
    title: "Design a key-value store",
    blurb:
      "Build a distributed hash map: consistent hashing for placement, replication for durability, and the quorum dial between consistency and availability.",
    kind: "tool",
    topic: "System design",
    tags: ["quorum", "replication", "CAP"],
    status: "soon",
    group: "design",
  },
  {
    slug: "web-crawler",
    title: "Design a web crawler",
    blurb:
      "A BFS frontier, politeness delays per host, and dedup with a bloom filter - crawl a tiny web without hammering any one domain.",
    kind: "tool",
    topic: "System design",
    tags: ["BFS", "frontier", "politeness"],
    status: "soon",
    group: "design",
  },
  {
    slug: "notification-system",
    title: "Design a notification system",
    blurb:
      "Fan a single event out to push, SMS and email through queues and workers, with retries and rate limits at each provider.",
    kind: "tool",
    topic: "System design",
    tags: ["fan-out", "queues", "providers"],
    status: "soon",
    group: "design",
  },
  {
    slug: "news-feed",
    title: "Design a news feed",
    blurb:
      "Fan-out on write vs on read - the timeline trade-off that decides whether a celebrity post melts your database.",
    kind: "tool",
    topic: "System design",
    tags: ["fan-out", "timeline", "celebrity"],
    status: "soon",
    group: "design",
  },
  {
    slug: "chat-system",
    title: "Design a chat system",
    blurb:
      "WebSocket sessions, presence, and message ordering - deliver a message exactly once across a fleet of stateful chat servers.",
    kind: "tool",
    topic: "System design",
    tags: ["websocket", "presence", "ordering"],
    status: "soon",
    group: "design",
  },
  {
    slug: "search-autocomplete",
    title: "Design search autocomplete",
    blurb:
      "A trie of top queries served in milliseconds - prefix lookups, cached suggestions, and ranking by popularity as you type.",
    kind: "tool",
    topic: "System design",
    tags: ["trie", "prefix", "top-k"],
    status: "soon",
    group: "design",
  },
  {
    slug: "video-streaming",
    title: "Design a video platform",
    blurb:
      "Upload, transcode into multiple bitrates, and stream from a CDN - adaptive bitrate that scales from one viewer to millions.",
    kind: "tool",
    topic: "System design",
    tags: ["transcoding", "CDN", "adaptive bitrate"],
    status: "soon",
    group: "design",
  },
  {
    slug: "file-storage",
    title: "Design a file store",
    blurb:
      "Sync files across devices with block-level dedup, deltas and a metadata service - only the changed chunks ever cross the wire.",
    kind: "tool",
    topic: "System design",
    tags: ["block sync", "dedup", "metadata"],
    status: "soon",
    group: "design",
  },
];

export const liveLab = lab.filter((e) => e.status === "live");

export function getEntry(slug: string): LabEntry | undefined {
  return lab.find((e) => e.slug === slug);
}
