"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  Callout,
  Note,
  Panel,
  Segmented,
  Slider,
  Toggle,
} from "@/components/lab/ui";

// ─── Shared hash util ────────────────────────────────────────────────────────
function fnv1a(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// ─── Ring geometry (Consistent Hashing tab) ──────────────────────────────────
const pos = (s: string) => fnv1a(s) / 4294967296;
const SERVER_COLORS = [
  "#494fdf",
  "#00a87e",
  "#ec7e00",
  "#e23b4a",
  "#7c5cff",
  "#0891b2",
];
const MAX_SERVERS = 6;
const TAU = Math.PI * 2;
const CX = 170;
const CY = 170;
const R = 124;

function ptOnRing(p: number, r = R): [number, number] {
  const a = p * TAU - Math.PI / 2;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}
function arcPath(a: number, b: number, r = R): string {
  const [x1, y1] = ptOnRing(a, r);
  const [x2, y2] = ptOnRing(b, r);
  let span = b - a;
  if (span < 0) span += 1;
  const large = span > 0.5 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
type VPoint = { pos: number; server: number };
function vnodePoints(serverCount: number, vnodes: number): VPoint[] {
  const pts: VPoint[] = [];
  for (let s = 0; s < serverCount; s++)
    for (let v = 0; v < vnodes; v++)
      pts.push({ pos: pos(`server-${s}#${v}`), server: s });
  pts.sort((a, b) => a.pos - b.pos);
  return pts;
}
function ownerOf(p: number, pts: VPoint[]): number {
  for (let i = 0; i < pts.length; i++) if (pts[i].pos >= p) return pts[i].server;
  return pts.length ? pts[0].server : 0;
}
function assignKeys(sc: number, vn: number, kp: number[]): number[] {
  const pts = vnodePoints(sc, vn);
  return kp.map((p) => ownerOf(p, pts));
}

// ─── TAB 1: Hash Tables ──────────────────────────────────────────────────────
type Item = { id: number; key: string; hash: number };
const WORDS = [
  "red","blue","green","gold","teal","rose","lime","navy",
  "plum","sage","ruby","jade","coral","amber","slate","mint",
];

function HashTables() {
  const [buckets, setBuckets] = useState(8);
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [lastId, setLastId] = useState<number | null>(null);
  const nextId = useMemo(
    () => (items.length ? Math.max(...items.map((i) => i.id)) + 1 : 0),
    [items]
  );

  function add(raw: string) {
    const key = raw.trim().toLowerCase();
    if (!key) return;
    const hash = fnv1a(key);
    setItems((prev) => [...prev, { id: nextId, key, hash }]);
    setLastId(nextId);
    setInput("");
  }
  function addRandom() {
    const pool = WORDS.filter((w) => !items.some((i) => i.key === w));
    const src = pool.length ? pool : WORDS;
    const word = src[Math.floor(Math.random() * src.length)];
    add(
      word +
        (items.some((i) => i.key === word)
          ? Math.floor(Math.random() * 90 + 10)
          : "")
    );
  }
  function reset() {
    setItems([]);
    setLastId(null);
  }

  const table: Item[][] = Array.from({ length: buckets }, () => []);
  items.forEach((it) => table[it.hash % buckets].push(it));
  const loadFactor = items.length / buckets;
  const collisions = table
    .filter((b) => b.length > 1)
    .reduce((acc, b) => acc + (b.length - 1), 0);
  const maxDepth = Math.max(1, ...table.map((b) => b.length));

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A hash table turns a key into an array index. Run the key through a{" "}
        <strong>hash function</strong> to get a big number, then take it{" "}
        <strong>modulo the table size</strong> to land in a bucket. Two
        different keys can land in the same bucket - a{" "}
        <strong>collision</strong> - so each bucket holds a small chain.
      </Note>

      <Panel className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <p className="mono-label text-[var(--slate)]">// insert a key</p>
          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add(input)}
              placeholder="type a key..."
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[var(--ink)]"
            />
            <ActionButton onClick={() => add(input)}>Hash</ActionButton>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={addRandom}
              className="tag-mono transition-colors hover:border-[var(--ink)]"
            >
              + random key
            </button>
            <button
              onClick={reset}
              className="tag-mono transition-colors hover:border-[var(--ink)]"
            >
              reset
            </button>
          </div>
        </div>
        <div className="w-full sm:max-w-[240px]">
          <Slider
            label="table size (buckets)"
            min={4}
            max={16}
            value={buckets}
            onChange={setBuckets}
          />
        </div>
      </Panel>

      {lastId !== null &&
        (() => {
          const it = items.find((i) => i.id === lastId);
          if (!it) return null;
          return (
            <Panel tone="stone" className="p-5">
              <p className="font-mono text-[13px] leading-relaxed text-[var(--body)]">
                <span className="font-medium text-[var(--primary)]">
                  &quot;{it.key}&quot;
                </span>{" "}
                → hash{" "}
                <span className="text-[var(--ink)]">
                  {it.hash.toLocaleString()}
                </span>{" "}
                <span className="text-[var(--stone-text)]">% {buckets}</span> ={" "}
                <span className="rounded bg-[var(--primary)] px-1.5 py-0.5 text-white">
                  bucket {it.hash % buckets}
                </span>
              </p>
            </Panel>
          );
        })()}

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(buckets, 8)}, minmax(0, 1fr))`,
        }}
      >
        {table.map((bucket, i) => (
          <div key={i} className="flex flex-col">
            <div
              className={`mb-2 rounded-[8px] border px-2 py-1.5 text-center font-mono text-[12px] ${
                bucket.length > 1
                  ? "border-[var(--coral-soft)] bg-[#fff5f2] text-[#c2412a]"
                  : "border-[var(--hairline)] bg-[var(--stone)] text-[var(--slate)]"
              }`}
            >
              {i}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              {bucket.map((it, depth) => (
                <div
                  key={it.id}
                  className={`rounded-[8px] px-2 py-2 text-center text-[12px] font-medium ${
                    it.id === lastId
                      ? "lab-pop bg-[var(--coral)] text-white"
                      : depth > 0
                        ? "bg-[var(--coral-soft)]/40 text-[#c2412a]"
                        : "bg-[var(--green-wash)] text-[var(--green)]"
                  }`}
                  title={`hash ${it.hash}`}
                >
                  {it.key}
                </div>
              ))}
              {bucket.length === 0 && (
                <div className="rounded-[8px] border border-dashed border-[var(--hairline)] py-2 text-center text-[11px] text-[var(--muted)]">
                  empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <div>
          <p className="mono-label text-[var(--muted)]">keys</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">
            {items.length}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">load factor (n/m)</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">
            {loadFactor.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">collisions</p>
          <p className="display mt-1 text-[24px] text-[var(--coral)]">
            {collisions}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">longest chain</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">
            {maxDepth}
          </p>
        </div>
      </Panel>

      <Note>
        Try this: insert eight keys into eight buckets. You&apos;d hope for one
        per bucket, but you won&apos;t get it - random hashing clusters (the{" "}
        <em>birthday paradox</em>). Now <strong>shrink the table</strong> and
        watch chains grow: a lookup has to walk the chain, so performance decays
        from O(1) toward O(n) as the load factor climbs. Real hash maps fix this
        by <strong>resizing</strong> once the load factor passes ~0.75.
      </Note>
    </div>
  );
}

// ─── TAB 2: Consistent Hashing Ring ─────────────────────────────────────────
function ConsistentHashRing() {
  const [servers, setServers] = useState(3);
  const [vnodes, setVnodes] = useState(1);
  const [keysCount, setKeysCount] = useState(20);
  const [moved, setMoved] = useState<Set<number>>(new Set());
  const [lastAction, setLastAction] = useState<string>("");

  const keyPos = useMemo(
    () => Array.from({ length: keysCount }, (_, k) => pos(`key-${k}`)),
    [keysCount]
  );
  const points = useMemo(() => vnodePoints(servers, vnodes), [servers, vnodes]);
  const assignment = useMemo(
    () => keyPos.map((p) => ownerOf(p, points)),
    [keyPos, points]
  );
  const segments = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((pt, i) => {
      const prev = points[(i - 1 + points.length) % points.length];
      return { from: prev.pos, to: pt.pos, server: pt.server };
    });
  }, [points]);
  const counts = useMemo(() => {
    const c = new Array(servers).fill(0);
    assignment.forEach((s) => (c[s] += 1));
    return c;
  }, [assignment, servers]);
  const compare = useMemo(() => {
    if (servers < 2) return null;
    const ringBefore = assignment;
    const ringAfter = assignKeys(servers - 1, vnodes, keyPos);
    let ringMoved = 0;
    for (let i = 0; i < keysCount; i++)
      if (ringBefore[i] !== ringAfter[i]) ringMoved++;
    let modMoved = 0;
    for (let i = 0; i < keysCount; i++) {
      const h = fnv1a(`key-${i}`);
      if (h % servers !== h % (servers - 1)) modMoved++;
    }
    return {
      ring: Math.round((ringMoved / keysCount) * 100),
      mod: Math.round((modMoved / keysCount) * 100),
    };
  }, [assignment, servers, vnodes, keyPos, keysCount]);

  function changeServers(next: number, label: string) {
    const before = assignment;
    const after = assignKeys(next, vnodes, keyPos);
    const m = new Set<number>();
    for (let i = 0; i < keysCount; i++) if (before[i] !== after[i]) m.add(i);
    setMoved(m);
    setLastAction(label);
    setServers(next);
  }
  function clearMoved() {
    if (moved.size) setMoved(new Set());
    if (lastAction) setLastAction("");
  }

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Spread keys across servers with <strong>hash(key) % N</strong> and it
        works perfectly - until N changes. Drop one server and the modulo shifts
        for almost <em>every</em> key, so almost every cache lookup suddenly
        misses. Consistent hashing fixes this by placing servers and keys on a{" "}
        <strong>ring</strong> instead.
      </Note>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Panel tone="stone" className="flex flex-col items-center gap-4 p-6">
          <svg
            viewBox="0 0 340 340"
            className="w-full max-w-[360px]"
            role="img"
            aria-label="Consistent hashing ring"
          >
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="var(--hairline-light)"
              strokeWidth={16}
            />
            {segments.map((seg, i) => (
              <path
                key={i}
                d={arcPath(seg.from, seg.to)}
                fill="none"
                stroke={SERVER_COLORS[seg.server]}
                strokeWidth={16}
                strokeOpacity={0.85}
              />
            ))}
            {points.map((pt, i) => {
              const [x1, y1] = ptOnRing(pt.pos, R - 9);
              const [x2, y2] = ptOnRing(pt.pos, R + 9);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={SERVER_COLORS[pt.server]}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              );
            })}
            {keyPos.map((p, k) => {
              const [x, y] = ptOnRing(p, R);
              const isMoved = moved.has(k);
              return (
                <g key={k}>
                  {isMoved && (
                    <circle
                      cx={x}
                      cy={y}
                      r={8.5}
                      fill="none"
                      stroke="var(--ink)"
                      strokeWidth={1.5}
                      className="lab-pop"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={4.5}
                    fill={SERVER_COLORS[assignment[k]]}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
            <text
              x={CX}
              y={CY - 6}
              textAnchor="middle"
              className="font-mono"
              fontSize={11}
              fill="var(--stone-text)"
            >
              hash ring
            </text>
            <text
              x={CX}
              y={CY + 12}
              textAnchor="middle"
              className="font-mono"
              fontSize={9}
              fill="var(--stone-text)"
            >
              key - first server clockwise
            </text>
          </svg>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {Array.from({ length: servers }).map((_, s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink)]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: SERVER_COLORS[s] }}
                />
                server {s} &middot; {counts[s]}{" "}
                {counts[s] === 1 ? "key" : "keys"}
              </span>
            ))}
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel className="flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="mono-label text-[var(--slate)]">
                servers on the ring
              </span>
              <div className="flex items-center gap-2">
                <ActionButton
                  variant="ghost"
                  onClick={() =>
                    changeServers(
                      servers - 1,
                      `Removed server ${servers - 1}`
                    )
                  }
                  disabled={servers <= 1}
                >
                  - remove
                </ActionButton>
                <span className="w-6 text-center font-mono text-[16px] font-medium text-[var(--ink)]">
                  {servers}
                </span>
                <ActionButton
                  onClick={() =>
                    changeServers(servers + 1, `Added server ${servers}`)
                  }
                  disabled={servers >= MAX_SERVERS}
                >
                  + add
                </ActionButton>
              </div>
            </div>
            <Slider
              label="virtual nodes / server"
              min={1}
              max={50}
              value={vnodes}
              onChange={(v) => {
                setVnodes(v);
                clearMoved();
              }}
              display={`${vnodes}x`}
            />
            <Slider
              label="keys"
              min={6}
              max={48}
              value={keysCount}
              onChange={(v) => {
                setKeysCount(v);
                clearMoved();
              }}
            />
          </Panel>

          {lastAction ? (
            <Callout
              label={`// ${lastAction}`}
              tone={moved.size / keysCount > 0.4 ? "warn" : "info"}
            >
              Only{" "}
              <strong>
                {moved.size} of {keysCount}
              </strong>{" "}
              keys had to move ({Math.round((moved.size / keysCount) * 100)}%)
              - outlined on the ring. Every other key stayed exactly where it
              was, so its cache entry is still valid.
            </Callout>
          ) : (
            <Callout label="// try it" tone="info">
              Add or remove a server and watch which keys move. With consistent
              hashing only the keys in the affected arc are remapped - roughly{" "}
              <strong>k/n</strong> of them - not the whole keyspace.
            </Callout>
          )}

          {compare && (
            <Panel tone="stone" className="p-6">
              <p className="mono-label text-[var(--muted)]">
                remove one server - keys remapped
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  {
                    label: "Consistent ring",
                    v: compare.ring,
                    color: "var(--accent-teal)",
                  },
                  {
                    label: "Plain hash % N",
                    v: compare.mod,
                    color: "var(--accent-danger)",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-[13px] text-[var(--ink)]">
                      {row.label}
                    </span>
                    <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[var(--hairline-light)]">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all"
                        style={{
                          width: `${Math.max(2, row.v)}%`,
                          background: row.color,
                        }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-[13px] text-[var(--charcoal)]">
                      {row.v}%
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <Callout label="// virtual nodes" tone="key">
        With one point per server the ring is lumpy - by luck one server can own
        a huge arc and another almost none (push virtual nodes to 1 and watch
        the key counts skew). Give each server <strong>many</strong> virtual
        nodes and its arcs interleave all around the ring, so the load evens
        out. A couple hundred virtual nodes per server gets the spread within
        ~5% of even. The cost is just a little memory to track the extra points.
      </Callout>

      <Note>
        This is the partitioning trick behind Amazon Dynamo, Apache Cassandra,
        Discord and Akamai&apos;s CDN. It also tames the hot key problem: because
        every server is sprinkled all over the ring, no single node inherits all
        the popular keys when its neighbour fails.
      </Note>
    </div>
  );
}

// ─── TAB 3: Hot Keys ─────────────────────────────────────────────────────────
const NUM_SERVERS = 4;
const HOT_KEY = "trending:viral_post";
const HOT_SERVER = fnv1a(HOT_KEY) % NUM_SERVERS;
const PEAK_RPS = 120;
const TICK_MS = 500;

function getShardServer(shard: number): number {
  return fnv1a(`${HOT_KEY}:${shard}`) % NUM_SERVERS;
}

function serverStatus(load: number): "healthy" | "warm" | "hot" {
  const fair = PEAK_RPS / NUM_SERVERS;
  const ratio = load / fair;
  if (ratio > 2.5) return "hot";
  if (ratio > 1.5) return "warm";
  return "healthy";
}

function HotKeys() {
  const [hotShare, setHotShare] = useState(70);
  const [salted, setSalted] = useState(false);
  const [shards, setShards] = useState(4);
  const [loads, setLoads] = useState(() => new Array(NUM_SERVERS).fill(0) as number[]);
  const [totalReqs, setTotalReqs] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const hotRps = (PEAK_RPS * hotShare) / 100;
      const normalRps = PEAK_RPS - hotRps;
      const target = new Array(NUM_SERVERS).fill(0) as number[];

      for (let s = 0; s < NUM_SERVERS; s++) target[s] += normalRps / NUM_SERVERS;

      if (salted) {
        for (let sh = 0; sh < shards; sh++) {
          target[getShardServer(sh)] += hotRps / shards;
        }
      } else {
        target[HOT_SERVER] += hotRps;
      }

      setLoads((prev) => prev.map((v, i) => v * 0.55 + target[i] * 0.45));
      setTotalReqs((prev) => prev + Math.round((PEAK_RPS * TICK_MS) / 1000));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [hotShare, salted, shards]);

  const maxDisplay = PEAK_RPS * 1.05;
  const fair = PEAK_RPS / NUM_SERVERS;

  // Shard-to-server mapping for legend
  const shardMap = useMemo(
    () =>
      Array.from({ length: shards }, (_, sh) => ({
        shard: sh,
        server: getShardServer(sh),
      })),
    [shards]
  );
  const shardsOnServer = useMemo(() => {
    const m: Record<number, number[]> = {};
    shardMap.forEach(({ shard, server }) => {
      if (!m[server]) m[server] = [];
      m[server].push(shard);
    });
    return m;
  }, [shardMap]);

  const statusColors = {
    healthy: {
      ring: "ring-[rgba(0,168,126,0.3)]",
      bg: "bg-[rgba(0,168,126,0.04)]",
      bar: "var(--accent-teal)",
      dot: "bg-[var(--accent-teal)]",
      text: "text-[var(--accent-teal)]",
    },
    warm: {
      ring: "ring-[rgba(236,126,0,0.35)]",
      bg: "bg-[rgba(236,126,0,0.04)]",
      bar: "var(--accent-warning)",
      dot: "bg-[var(--accent-warning)]",
      text: "text-[var(--accent-warning)]",
    },
    hot: {
      ring: "ring-[rgba(226,59,74,0.4)]",
      bg: "bg-[rgba(226,59,74,0.05)]",
      bar: "var(--accent-danger)",
      dot: "bg-[var(--accent-danger)]",
      text: "text-[var(--accent-danger)]",
    },
  };

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Hash functions are deterministic: the same key always maps to the same
        server. If one key suddenly attracts 10x normal traffic - a viral post,
        a trending product, a celebrity profile - that server drowns while its
        peers sit idle. This is the <strong>hot key problem</strong>.
      </Note>

      <Panel className="flex flex-col gap-5 p-6">
        <Slider
          label="hot key share of traffic"
          min={10}
          max={90}
          value={hotShare}
          onChange={setHotShare}
          display={`${hotShare}%`}
        />
        <div className="flex flex-wrap items-center gap-4">
          <Toggle
            label="key salting"
            checked={salted}
            onChange={setSalted}
          />
          {salted && (
            <div className="flex items-center gap-2">
              <span className="mono-label text-[var(--slate)]">shards</span>
              {[2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setShards(n)}
                  className={`rounded-[7px] px-3 py-1 font-mono text-[13px] transition-colors ${
                    shards === n
                      ? "bg-[var(--near-black)] text-white"
                      : "border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--ink)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Hot key label */}
      <div className="flex items-center gap-3">
        <span className="mono-label text-[var(--muted)]">hot key</span>
        <code className="rounded-[8px] border border-[var(--hairline)] bg-[var(--stone)] px-3 py-1 font-mono text-[13px] text-[var(--ink)]">
          {HOT_KEY}
        </code>
        <span className="mono-label text-[var(--slate)]">
          {salted
            ? `split into ${shards} shards`
            : `always routes to S${HOT_SERVER}`}
        </span>
      </div>

      {/* Server grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loads.map((load, i) => {
          const status = serverStatus(load);
          const c = statusColors[status];
          const pct = Math.min(100, (load / maxDisplay) * 100);
          const isHotOwner = !salted && i === HOT_SERVER;
          const myShards = shardsOnServer[i] ?? [];

          return (
            <div
              key={i}
              className={`rounded-[14px] p-4 ring-1 transition-colors duration-500 ${c.ring} ${c.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] font-medium text-[var(--ink)]">
                  S{i}
                </span>
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
              </div>

              <p className={`display mt-2 text-[22px] ${c.text}`}>
                {Math.round(load)}
                <span className="text-[12px] font-normal text-[var(--slate)]">
                  {" "}
                  req/s
                </span>
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--hairline-light)]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, background: c.bar }}
                />
              </div>

              <div className="mt-2.5 min-h-[18px]">
                {isHotOwner && (
                  <p className="mono-label text-[var(--accent-danger)]">
                    hot key owner
                  </p>
                )}
                {salted && myShards.length > 0 && (
                  <p className="mono-label text-[var(--slate)]">
                    shards:{" "}
                    {myShards.map((s) => `:{${s}}`).join(" ")}
                  </p>
                )}
                {salted && myShards.length === 0 && (
                  <p className="mono-label text-[var(--muted)]">no shards</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats bar */}
      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <div>
          <p className="mono-label text-[var(--muted)]">total requests</p>
          <p className="display mt-1 text-[22px] text-[var(--ink)]">
            {totalReqs.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">fair share / server</p>
          <p className="display mt-1 text-[22px] text-[var(--ink)]">
            {Math.round(fair)} req/s
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">peak server load</p>
          <p
            className={`display mt-1 text-[22px] ${
              Math.max(...loads) > fair * 2
                ? "text-[var(--accent-danger)]"
                : "text-[var(--accent-teal)]"
            }`}
          >
            {Math.round(Math.max(...loads))} req/s
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">imbalance ratio</p>
          <p
            className={`display mt-1 text-[22px] ${
              Math.max(...loads) / Math.max(1, Math.min(...loads)) > 2
                ? "text-[var(--accent-danger)]"
                : "text-[var(--ink)]"
            }`}
          >
            {(Math.max(...loads) / Math.max(1, Math.min(...loads))).toFixed(1)}x
          </p>
        </div>
      </Panel>

      {!salted ? (
        <Callout label="// the hot key problem" tone="warn">
          S{HOT_SERVER} is handling <strong>{hotShare}%</strong> of all traffic
          because it owns <code>{HOT_KEY}</code>. The other servers are
          underutilised while S{HOT_SERVER} risks timeouts, OOM, and cascading
          failures - even though you have plenty of total capacity. Toggle{" "}
          <strong>key salting</strong> above to see the fix.
        </Callout>
      ) : (
        <Callout label="// key salting" tone="info">
          <code>{HOT_KEY}</code> is split into{" "}
          <strong>{shards} shards</strong> (:{0} ... :{shards - 1}). Writers
          fan out to all shards; readers pick one at random. Load distributes
          across whichever servers own those shard hashes - no single server is
          the bottleneck.
        </Callout>
      )}

      <Note>
        Key salting trades write amplification for read scalability. Other
        mitigations: <strong>local in-process caching</strong> (absorbs reads
        before they reach the distributed cache), <strong>read replicas</strong>{" "}
        scoped to the hot key, and <strong>scatter-gather</strong> (read all
        shards and merge counts). The right choice depends on your read/write
        ratio and whether the key is mutable. A celebrity profile is read-heavy
        and rarely updated - salting is ideal. A trending counter is
        write-heavy - you need atomic merges or a CRDT.
      </Note>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
type Tab = "tables" | "ring" | "hotkeys";
const TABS: { value: Tab; label: string }[] = [
  { value: "tables", label: "Hash tables" },
  { value: "ring", label: "Consistent hashing" },
  { value: "hotkeys", label: "Hot keys" },
];

export default function HashingLab() {
  const [tab, setTab] = useState<Tab>("tables");
  return (
    <div className="flex flex-col gap-8">
      <Segmented options={TABS} value={tab} onChange={setTab} />
      {tab === "tables" && <HashTables />}
      {tab === "ring" && <ConsistentHashRing />}
      {tab === "hotkeys" && <HotKeys />}
    </div>
  );
}
