"use client";

import { useMemo, useState } from "react";
import { ActionButton, Callout, Note, Panel, Slider } from "@/components/lab/ui";

// Deterministic 32-bit string hash (FNV-1a). Normalised to [0,1) it becomes a
// position on the hash ring - the same role SHA-1 plays in the book, just small
// enough to draw.
function fnv1a(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}
const pos = (s: string) => fnv1a(s) / 4294967296;

const SERVER_COLORS = [
  "#494fdf", // cobalt
  "#00a87e", // teal
  "#ec7e00", // amber
  "#e23b4a", // red
  "#7c5cff", // violet
  "#0891b2", // cyan
];
const MAX_SERVERS = 6;

// --- ring geometry ---
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
  for (let s = 0; s < serverCount; s++) {
    for (let v = 0; v < vnodes; v++) {
      pts.push({ pos: pos(`server-${s}#${v}`), server: s });
    }
  }
  pts.sort((a, b) => a.pos - b.pos);
  return pts;
}
function ownerOf(p: number, pts: VPoint[]): number {
  // walk clockwise to the first virtual node at or past this position
  for (let i = 0; i < pts.length; i++) if (pts[i].pos >= p) return pts[i].server;
  return pts.length ? pts[0].server : 0; // wrap past the top
}
function assign(serverCount: number, vnodes: number, keyPos: number[]): number[] {
  const pts = vnodePoints(serverCount, vnodes);
  return keyPos.map((p) => ownerOf(p, pts));
}

export default function ConsistentHashing() {
  const [servers, setServers] = useState(3);
  const [vnodes, setVnodes] = useState(1);
  const [keysCount, setKeysCount] = useState(20);
  const [moved, setMoved] = useState<Set<number>>(new Set());
  const [lastAction, setLastAction] = useState<string>("");

  // Stable key positions on the ring.
  const keyPos = useMemo(
    () => Array.from({ length: keysCount }, (_, k) => pos(`key-${k}`)),
    [keysCount]
  );

  const points = useMemo(() => vnodePoints(servers, vnodes), [servers, vnodes]);
  const assignment = useMemo(
    () => keyPos.map((p) => ownerOf(p, points)),
    [keyPos, points]
  );

  // owned arc segments: each virtual node owns the arc just behind it (CCW).
  const segments = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((pt, i) => {
      const prev = points[(i - 1 + points.length) % points.length];
      return { from: prev.pos, to: pt.pos, server: pt.server };
    });
  }, [points]);

  // keys per server (load balance).
  const counts = useMemo(() => {
    const c = new Array(servers).fill(0);
    assignment.forEach((s) => (c[s] += 1));
    return c;
  }, [assignment, servers]);

  // Live comparison: removing one server, ring vs plain hash % N.
  const compare = useMemo(() => {
    if (servers < 2) return null;
    const ringBefore = assignment;
    const ringAfter = assign(servers - 1, vnodes, keyPos);
    let ringMoved = 0;
    for (let i = 0; i < keysCount; i++) if (ringBefore[i] !== ringAfter[i]) ringMoved++;
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
    const after = assign(next, vnodes, keyPos);
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
        {/* The ring */}
        <Panel tone="stone" className="flex flex-col items-center gap-4 p-6">
          <svg viewBox="0 0 340 340" className="w-full max-w-[360px]" role="img" aria-label="Consistent hashing ring">
            {/* base ring */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--hairline-light)" strokeWidth={16} />
            {/* owned arcs */}
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
            {/* virtual-node ticks */}
            {points.map((pt, i) => {
              const [x1, y1] = ptOnRing(pt.pos, R - 9);
              const [x2, y2] = ptOnRing(pt.pos, R + 9);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={SERVER_COLORS[pt.server]} strokeWidth={2.5} strokeLinecap="round" />
              );
            })}
            {/* keys */}
            {keyPos.map((p, k) => {
              const [x, y] = ptOnRing(p, R);
              const isMoved = moved.has(k);
              return (
                <g key={k}>
                  {isMoved && <circle cx={x} cy={y} r={8.5} fill="none" stroke="var(--ink)" strokeWidth={1.5} className="lab-pop" />}
                  <circle cx={x} cy={y} r={4.5} fill={SERVER_COLORS[assignment[k]]} stroke="#fff" strokeWidth={1.5} />
                </g>
              );
            })}
            {/* clockwise hint */}
            <text x={CX} y={CY - 6} textAnchor="middle" className="font-mono" fontSize={11} fill="var(--stone-text)">
              hash ring
            </text>
            <text x={CX} y={CY + 12} textAnchor="middle" className="font-mono" fontSize={9} fill="var(--stone-text)">
              key → first server clockwise ↻
            </text>
          </svg>

          {/* legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {Array.from({ length: servers }).map((_, s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink)]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: SERVER_COLORS[s] }} />
                server {s} · {counts[s]} {counts[s] === 1 ? "key" : "keys"}
              </span>
            ))}
          </div>
        </Panel>

        {/* Controls + readouts */}
        <div className="flex flex-col gap-6">
          <Panel className="flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="mono-label text-[var(--slate)]">servers on the ring</span>
              <div className="flex items-center gap-2">
                <ActionButton
                  variant="ghost"
                  onClick={() => changeServers(servers - 1, `Removed server ${servers - 1}`)}
                  disabled={servers <= 1}
                >
                  - remove
                </ActionButton>
                <span className="w-6 text-center font-mono text-[16px] font-medium text-[var(--ink)]">{servers}</span>
                <ActionButton
                  onClick={() => changeServers(servers + 1, `Added server ${servers}`)}
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
              onChange={(v) => { setVnodes(v); clearMoved(); }}
              display={`${vnodes}×`}
            />
            <Slider
              label="keys"
              min={6}
              max={48}
              value={keysCount}
              onChange={(v) => { setKeysCount(v); clearMoved(); }}
            />
          </Panel>

          {/* moved-on-last-change readout */}
          {lastAction ? (
            <Callout label={`// ${lastAction}`} tone={moved.size / keysCount > 0.4 ? "warn" : "info"}>
              Only <strong>{moved.size} of {keysCount}</strong> keys had to move
              ({Math.round((moved.size / keysCount) * 100)}%) - outlined on the
              ring. Every other key stayed exactly where it was, so its cache
              entry is still valid.
            </Callout>
          ) : (
            <Callout label="// try it" tone="info">
              Add or remove a server and watch which keys move. With consistent
              hashing only the keys in the affected arc are remapped - roughly{" "}
              <strong>k/n</strong> of them - not the whole keyspace.
            </Callout>
          )}

          {/* live ring-vs-modulo comparison */}
          {compare && (
            <Panel tone="stone" className="p-6">
              <p className="mono-label text-[var(--mute)]">remove one server - keys remapped</p>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { label: "Consistent ring", v: compare.ring, color: "var(--accent-teal)" },
                  { label: "Plain hash % N", v: compare.mod, color: "var(--accent-danger)" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-[13px] text-[var(--ink)]">{row.label}</span>
                    <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[var(--hairline-light)]">
                      <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${Math.max(2, row.v)}%`, background: row.color }} />
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-[13px] text-[var(--charcoal)]">{row.v}%</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <Callout label="// virtual nodes" tone="key">
        With one point per server the ring is lumpy - by luck one server can own
        a huge arc and another almost none (push virtual nodes to 1 and watch the
        key counts skew). Give each server <strong>many</strong> virtual nodes
        and its arcs interleave all around the ring, so the load evens out. A
        couple hundred virtual nodes per server gets the spread within ~5% of
        even. The cost is just a little memory to track the extra points.
      </Callout>

      <Note>
        This is the partitioning trick behind Amazon Dynamo, Apache Cassandra,
        Discord and Akamai&apos;s CDN. It also tames the{" "}
        <strong>hotspot key</strong> problem: because every server is sprinkled
        all over the ring, no single node inherits all the popular keys when its
        neighbour fails.
      </Note>
    </div>
  );
}
