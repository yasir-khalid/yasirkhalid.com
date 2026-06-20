"use client";

// Proximity service (Alex Xu vol.2, ch.1) - a visual walkthrough of spatial
// indexing. Every concept in the chapter has its own animated panel: the naive
// 2D scan, the indexing taxonomy, the evenly-divided grid and its hotspots,
// geohash built bit by bit, the radius->precision mapping, the boundary
// problem + neighbour search, an animated quadtree build, the geohash-vs-
// quadtree trade-off, the S2 / Hilbert curve, and finally how the storage layer
// scales. All visualisations are light "illustration surfaces": teal = matched
// / healthy, cobalt = active, danger-red = missed / hotspot.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionButton,
  Callout,
  Note,
  Panel,
  Slider,
  Stat,
  Toggle,
} from "@/components/lab/ui";

// ---- deterministic PRNG so the map is stable across renders ----
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = { x: number; y: number }; // normalised [0,1], y = "north-ness" (1 = top)

// A clustered business distribution: a few dense "cities" plus sparse noise.
// This is what makes the grid lumpy and the quadtree carve unevenly.
function makeBusinesses(n: number, seed = 7): Pt[] {
  const rnd = mulberry32(seed);
  const clusters = [
    { x: 0.28, y: 0.7, s: 0.07, w: 0.4 },
    { x: 0.62, y: 0.58, s: 0.05, w: 0.3 },
    { x: 0.78, y: 0.28, s: 0.09, w: 0.18 },
    { x: 0.45, y: 0.4, s: 0.14, w: 0.12 }, // diffuse
  ];
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const r = rnd();
    let acc = 0;
    let c = clusters[0];
    for (const cl of clusters) {
      acc += cl.w;
      if (r <= acc) {
        c = cl;
        break;
      }
    }
    // box-muller-ish jitter
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * c.s * 0.5;
    const x = Math.min(0.97, Math.max(0.03, c.x + Math.cos(a) * d));
    const y = Math.min(0.97, Math.max(0.03, c.y + Math.sin(a) * d));
    pts.push({ x, y });
  }
  return pts;
}

// ---- screen mapping (north up) ----
const S = 300;
const sx = (x: number) => x * S;
const sy = (y: number) => (1 - y) * S;
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

const TEAL = "#00a87e";
const COBALT = "#494fdf";
const RED = "#e23b4a";

function SectionLabel({
  step,
  children,
}: {
  step: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[13px] font-semibold text-[var(--primary)]">
        {step}
      </span>
      <h2 className="heading text-[clamp(1.4rem,3vw,1.9rem)] text-[var(--ink)]">
        {children}
      </h2>
    </div>
  );
}

/* ============================================================ *
 * 1. The naive two-dimensional scan                            *
 * ============================================================ */
function NaiveScan() {
  const businesses = useMemo(() => makeBusinesses(140, 11), []);
  const center: Pt = { x: 0.32, y: 0.66 };
  const [radius, setRadius] = useState(0.16);
  const [scanIdx, setScanIdx] = useState(businesses.length);
  const [running, setRunning] = useState(false);
  const raf = useRef<number | null>(null);

  const matchedTotal = useMemo(
    () => businesses.filter((b) => dist(b, center) <= radius).length,
    [businesses, radius]
  );

  useEffect(() => {
    if (!running) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 3;
      setScanIdx(i);
      if (i >= businesses.length) {
        window.clearInterval(id);
        setRunning(false);
        setScanIdx(businesses.length);
      }
    }, 28);
    raf.current = id;
    return () => window.clearInterval(id);
  }, [running, businesses.length]);

  function run() {
    setScanIdx(0);
    setRunning(true);
  }

  const scannedSoFar = Math.min(scanIdx, businesses.length);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Panel tone="stone" className="p-5">
        <svg viewBox="0 0 300 300" className="w-full" role="img" aria-label="Naive radius scan over a map of businesses">
          <rect x={0} y={0} width={S} height={S} rx={10} fill="#fff" stroke="var(--hairline-light)" />
          {/* grid hints */}
          {[1, 2, 3].map((i) => (
            <g key={i} stroke="var(--hairline-light)" strokeWidth={1}>
              <line x1={(i * S) / 4} y1={0} x2={(i * S) / 4} y2={S} />
              <line x1={0} y1={(i * S) / 4} x2={S} y2={(i * S) / 4} />
            </g>
          ))}
          {/* search circle */}
          <circle cx={sx(center.x)} cy={sy(center.y)} r={radius * S} fill="rgba(73,79,223,0.08)" stroke={COBALT} strokeWidth={1.5} strokeDasharray="4 3" />
          {/* businesses */}
          {businesses.map((b, i) => {
            const inside = dist(b, center) <= radius;
            const checked = i < scannedSoFar;
            let fill = "var(--hairline)";
            if (checked) fill = inside ? TEAL : "#c9ccd1";
            return (
              <circle
                key={i}
                cx={sx(b.x)}
                cy={sy(b.y)}
                r={inside && checked ? 3.6 : 2.6}
                fill={fill}
                opacity={checked ? 1 : 0.55}
              />
            );
          })}
          {/* center pin */}
          <circle cx={sx(center.x)} cy={sy(center.y)} r={4.5} fill={COBALT} stroke="#fff" strokeWidth={1.5} />
        </svg>
      </Panel>

      <div className="flex flex-col gap-5">
        <Slider label="search radius" min={0.06} max={0.32} step={0.01} value={radius} onChange={setRadius} display={`${Math.round(radius * 100)} mi`} />
        <div className="flex items-center gap-3">
          <ActionButton onClick={run} disabled={running}>
            {running ? "scanning…" : "Run full scan"}
          </ActionButton>
          <span className="font-mono text-[13px] text-[var(--slate)]">
            checked {scannedSoFar}/{businesses.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6">
          <Stat label="rows scanned" value={`${scannedSoFar}`} sub="every business in the table" />
          <Stat label="actually nearby" value={`${matchedTotal}`} accent sub="inside the radius" />
        </div>
        <Callout label="// why this doesn't scale" tone="warn">
          The query is{" "}
          <code className="font-mono text-[13px]">
            WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
          </code>
          . Even with an index on latitude and one on longitude, each returns a
          thin <em>but very long</em> strip of the world. The database has to
          <strong> intersect two huge 1D result sets</strong> - it can use at
          most one of them. With 200M businesses you scan far more rows than the
          handful you return.
        </Callout>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 2. Indexing taxonomy                                          *
 * ============================================================ */
function Taxonomy() {
  const groups = [
    {
      kind: "Hash-based",
      tint: "rgba(73,79,223,0.08)",
      items: ["Even grid", "Geohash", "Cartesian tiers"],
      note: "Map a point to a fixed cell id with a function. No tree to build.",
    },
    {
      kind: "Tree-based",
      tint: "rgba(0,168,126,0.08)",
      items: ["Quadtree", "Google S2", "R-tree"],
      note: "Recursively split space, adapting to where the data actually is.",
    },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {groups.map((g) => (
        <Panel key={g.kind} className="p-6">
          <p className="mono-label text-[var(--primary)]">{g.kind}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {g.items.map((it) => (
              <span key={it} className="rounded-[8px] px-3 py-1.5 font-mono text-[13px] text-[var(--ink)]" style={{ background: g.tint }}>
                {it}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[14px] leading-[1.55] text-[var(--slate)]">{g.note}</p>
        </Panel>
      ))}
    </div>
  );
}

/* ============================================================ *
 * 3. Evenly divided grid + hotspots                            *
 * ============================================================ */
function EvenGrid() {
  const businesses = useMemo(() => makeBusinesses(220, 3), []);
  const [n, setN] = useState(8);

  const { cells, max } = useMemo(() => {
    const counts = new Array(n * n).fill(0);
    for (const b of businesses) {
      const cx = Math.min(n - 1, Math.floor(b.x * n));
      const cy = Math.min(n - 1, Math.floor(b.y * n));
      counts[cy * n + cx]++;
    }
    return { cells: counts, max: Math.max(1, ...counts) };
  }, [businesses, n]);

  const empty = cells.filter((c) => c === 0).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Panel tone="stone" className="p-5">
        <svg viewBox="0 0 300 300" className="w-full" role="img" aria-label="Evenly divided grid with density heatmap">
          {cells.map((c, i) => {
            const gx = i % n;
            const gy = Math.floor(i / n);
            const t = c / max;
            const fill = c === 0 ? "#fff" : `rgba(226,59,74,${0.12 + t * 0.7})`;
            return (
              <rect key={i} x={(gx * S) / n} y={((n - 1 - gy) * S) / n} width={S / n} height={S / n} fill={fill} stroke="var(--hairline-light)" strokeWidth={1} />
            );
          })}
          {businesses.map((b, i) => (
            <circle key={i} cx={sx(b.x)} cy={sy(b.y)} r={1.5} fill="rgba(25,28,31,0.45)" />
          ))}
        </svg>
      </Panel>
      <div className="flex flex-col gap-5">
        <Slider label="grid divisions per side" min={4} max={20} value={n} onChange={setN} display={`${n}×${n}`} />
        <div className="grid grid-cols-2 gap-x-6">
          <Stat label="busiest cell" value={`${max}`} accent sub="a downtown hotspot" />
          <Stat label="empty cells" value={`${empty}/${n * n}`} sub="oceans, parks, fields" />
        </div>
        <Callout label="// the fixed-grid problem" tone="warn">
          Real businesses cluster in cities. A fixed grid gives every patch of
          the planet the same cell size, so one downtown cell holds{" "}
          <strong>hundreds</strong> while most cells are empty. Make cells
          smaller to thin the hotspot and the sparse areas fragment into
          thousands of useless tiles. The grid can&apos;t adapt to density - which
          is exactly what geohash and quadtree fix.
        </Callout>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 4. Geohash, built bit by bit                                 *
 * ============================================================ */
const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

function geohash(x: number, y: number, nbits: number) {
  let lngLo = 0,
    lngHi = 1,
    latLo = 0,
    latHi = 1;
  const bits: number[] = [];
  for (let i = 0; i < nbits; i++) {
    if (i % 2 === 0) {
      const mid = (lngLo + lngHi) / 2;
      if (x >= mid) {
        bits.push(1);
        lngLo = mid;
      } else {
        bits.push(0);
        lngHi = mid;
      }
    } else {
      const mid = (latLo + latHi) / 2;
      if (y >= mid) {
        bits.push(1);
        latLo = mid;
      } else {
        bits.push(0);
        latHi = mid;
      }
    }
  }
  return { bits, cell: { x0: lngLo, x1: lngHi, y0: latLo, y1: latHi } };
}

function bitsToBase32(bits: number[]): string {
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    let v = 0;
    for (let j = 0; j < 5; j++) v = v * 2 + bits[i + j];
    out += BASE32[v];
  }
  return out;
}

function GeohashEncoder() {
  const businesses = useMemo(() => makeBusinesses(60, 21), []);
  const [pt, setPt] = useState<Pt>({ x: 0.64, y: 0.57 });
  const [bits, setBits] = useState(10);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { bits: bitArr, cell } = useMemo(() => geohash(pt.x, pt.y, bits), [pt, bits]);
  const b32 = bitsToBase32(bitArr);

  // all the splitting lines down to the current depth, for the recursive look
  const lines = useMemo(() => {
    const segs: { x1: number; y1: number; x2: number; y2: number; on: boolean }[] = [];
    let lngLo = 0,
      lngHi = 1,
      latLo = 0,
      latHi = 1;
    for (let i = 0; i < bits; i++) {
      if (i % 2 === 0) {
        const mid = (lngLo + lngHi) / 2;
        segs.push({ x1: sx(mid), y1: sy(latLo), x2: sx(mid), y2: sy(latHi), on: true });
        if (pt.x >= mid) lngLo = mid;
        else lngHi = mid;
      } else {
        const mid = (latLo + latHi) / 2;
        segs.push({ x1: sx(lngLo), y1: sy(mid), x2: sx(lngHi), y2: sy(mid), on: true });
        if (pt.y >= mid) latLo = mid;
        else latHi = mid;
      }
    }
    return segs;
  }, [pt, bits]);

  function place(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = 1 - (e.clientY - r.top) / r.height;
    setPt({ x: Math.min(0.99, Math.max(0.01, x)), y: Math.min(0.99, Math.max(0.01, y)) });
  }

  const cellW = cell.x1 - cell.x0;
  const cellH = cell.y1 - cell.y0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Panel tone="stone" className="p-5">
        <svg
          ref={svgRef}
          viewBox="0 0 300 300"
          className="w-full cursor-crosshair touch-none"
          onPointerDown={place}
          role="img"
          aria-label="Geohash recursive subdivision. Click to move the point."
        >
          <rect x={0} y={0} width={S} height={S} rx={8} fill="#fff" stroke="var(--hairline-light)" />
          {/* the resolved cell */}
          <rect x={sx(cell.x0)} y={sy(cell.y1)} width={cellW * S} height={cellH * S} fill="rgba(73,79,223,0.12)" stroke={COBALT} strokeWidth={1.5} />
          {/* subdivision lines */}
          {lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(25,28,31,0.18)" strokeWidth={i === lines.length - 1 ? 1.6 : 0.8} />
          ))}
          {/* businesses sharing the cell turn teal */}
          {businesses.map((b, i) => {
            const shared = b.x >= cell.x0 && b.x < cell.x1 && b.y >= cell.y0 && b.y < cell.y1;
            return <circle key={i} cx={sx(b.x)} cy={sy(b.y)} r={shared ? 3.2 : 2} fill={shared ? TEAL : "var(--hairline)"} />;
          })}
          {/* the point */}
          <circle cx={sx(pt.x)} cy={sy(pt.y)} r={5} fill={COBALT} stroke="#fff" strokeWidth={1.5} />
          <text x={6} y={S - 7} className="font-mono" fontSize={9} fill="var(--stone-text)">
            click anywhere to move the point
          </text>
        </svg>
      </Panel>

      <div className="flex flex-col gap-5">
        <Slider label="precision (bits)" min={0} max={25} value={bits} onChange={setBits} display={`${bits} bit${bits === 1 ? "" : "s"}`} />

        {/* bit string with lng/lat colouring */}
        <Panel className="p-5">
          <p className="mono-label text-[var(--mute)]">interleaved bits · cobalt = longitude, teal = latitude</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bitArr.length === 0 && <span className="text-[13px] text-[var(--muted)]">whole planet (no bits yet)</span>}
            {bitArr.map((b, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] font-mono text-[13px] font-semibold text-white"
                style={{ background: i % 2 === 0 ? COBALT : TEAL }}
              >
                {b}
              </span>
            ))}
          </div>
          {b32 && (
            <p className="mt-4 font-mono text-[15px] text-[var(--ink)]">
              base32: <span className="font-semibold text-[var(--primary)]">{b32}</span>
              <span className="ml-2 text-[12px] text-[var(--muted)]">
                ({Math.floor(bits / 5)} char{Math.floor(bits / 5) === 1 ? "" : "s"})
              </span>
            </p>
          )}
        </Panel>

        <Callout label="// how geohash works" tone="key">
          Split the world in half by longitude (left/right) - that&apos;s the
          first bit. Split by latitude (bottom/top) - the second bit. Keep
          alternating, halving the cell each time. Group the bits five at a time
          and map each group to a base32 character. A{" "}
          <strong>shared prefix means physically close</strong>: nearby points
          fall in the same cell and share a long prefix, so a prefix lookup
          finds neighbours.
        </Callout>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 5. Radius -> geohash length mapping (book table 1.5)         *
 * ============================================================ */
function RadiusMapping() {
  // Alex Xu table 1.5
  const table = [
    { len: 6, km: 0.5, mi: "0.31 mi" },
    { len: 5, km: 1, mi: "0.62 mi" },
    { len: 4, km: 2, mi: "1.24 mi" },
    { len: 4, km: 5, mi: "3.1 mi" },
    { len: 3, km: 20, mi: "12.42 mi" },
  ];
  // grid size by geohash length (table 1.4, approx, km)
  const cellByLen: Record<number, string> = {
    3: "156 km × 156 km",
    4: "39 km × 19.5 km",
    5: "4.9 km × 4.9 km",
    6: "1.2 km × 0.61 km",
  };
  const [idx, setIdx] = useState(1);
  const row = table[idx];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)]">
      <div className="flex flex-col gap-5">
        <Slider
          label="search radius"
          min={0}
          max={table.length - 1}
          value={idx}
          onChange={setIdx}
          display={`${row.km} km`}
        />
        <div className="grid grid-cols-2 gap-x-6">
          <Stat label="geohash length" value={`${row.len}`} accent sub={`${row.mi} radius`} />
          <Stat label="cell size" value={cellByLen[row.len] ?? "-"} sub="just covers the circle" />
        </div>
        <Callout label="// picking the precision" tone="info">
          The longer the geohash, the smaller the cell. You choose the{" "}
          <strong>shortest length whose cell still covers the search circle</strong>
          , then fetch that cell plus its eight neighbours. Too long and the cell
          is smaller than the radius (you miss results); too short and you drag
          back half a continent.
        </Callout>
      </div>
      <Panel tone="stone" className="p-5">
        <svg viewBox="0 0 300 300" className="w-full" role="img" aria-label="Cell size shrinking as radius shrinks">
          {(() => {
            const frac = [1, 0.62, 0.34, 0.34, 0.16][idx];
            const c = 150;
            const half = (frac * S) / 2;
            return (
              <>
                <rect x={0} y={0} width={S} height={S} rx={8} fill="#fff" stroke="var(--hairline-light)" />
                <rect x={c - half} y={c - half} width={half * 2} height={half * 2} fill="rgba(73,79,223,0.10)" stroke={COBALT} strokeWidth={1.5} />
                <circle cx={c} cy={c} r={half * 0.82} fill="rgba(0,168,126,0.12)" stroke={TEAL} strokeWidth={1.5} strokeDasharray="4 3" />
                <circle cx={c} cy={c} r={4} fill={COBALT} />
                <text x={c} y={c - half - 7} textAnchor="middle" className="font-mono" fontSize={10} fill="var(--stone-text)">
                  geohash cell (len {row.len})
                </text>
              </>
            );
          })()}
        </svg>
      </Panel>
    </div>
  );
}

/* ============================================================ *
 * 6. Boundary problem + 8-neighbour search                     *
 * ============================================================ */
function neighbourCells(gx: number, gy: number, n: number) {
  const out: { gx: number; gy: number }[] = [];
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      const nx = gx + dx;
      const ny = gy + dy;
      if (nx >= 0 && nx < n && ny >= 0 && ny < n) out.push({ gx: nx, gy: ny });
    }
  return out;
}

function BoundaryProblem() {
  const businesses = useMemo(() => makeBusinesses(120, 33), []);
  const n = 4; // grid for the demo (a fixed geohash precision)
  // user sits deliberately near a cell corner
  const user: Pt = { x: 0.49, y: 0.51 };
  const radius = 0.17;
  const [neighbours, setNeighbours] = useState(false);

  const ugx = Math.min(n - 1, Math.floor(user.x * n));
  const ugy = Math.min(n - 1, Math.floor(user.y * n));
  const searchCells = neighbours ? neighbourCells(ugx, ugy, n) : [{ gx: ugx, gy: ugy }];
  const inSearch = (b: Pt) => {
    const gx = Math.min(n - 1, Math.floor(b.x * n));
    const gy = Math.min(n - 1, Math.floor(b.y * n));
    return searchCells.some((c) => c.gx === gx && c.gy === gy);
  };

  const reallyNear = businesses.filter((b) => dist(b, user) <= radius);
  const found = reallyNear.filter(inSearch).length;
  const missed = reallyNear.length - found;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Panel tone="stone" className="p-5">
        <svg viewBox="0 0 300 300" className="w-full" role="img" aria-label="Geohash boundary problem and neighbour search">
          <rect x={0} y={0} width={S} height={S} rx={8} fill="#fff" stroke="var(--hairline-light)" />
          {/* searched cells */}
          {searchCells.map((c, i) => (
            <rect key={i} x={(c.gx * S) / n} y={((n - 1 - c.gy) * S) / n} width={S / n} height={S / n} fill="rgba(73,79,223,0.10)" />
          ))}
          {/* grid lines */}
          {Array.from({ length: n - 1 }).map((_, i) => (
            <g key={i} stroke="var(--hairline)" strokeWidth={1}>
              <line x1={((i + 1) * S) / n} y1={0} x2={((i + 1) * S) / n} y2={S} />
              <line x1={0} y1={((i + 1) * S) / n} x2={S} y2={((i + 1) * S) / n} />
            </g>
          ))}
          {/* radius */}
          <circle cx={sx(user.x)} cy={sy(user.y)} r={radius * S} fill="none" stroke={COBALT} strokeWidth={1.3} strokeDasharray="4 3" />
          {/* businesses */}
          {businesses.map((b, i) => {
            const near = dist(b, user) <= radius;
            const seen = inSearch(b);
            let fill = "var(--hairline)";
            if (near && seen) fill = TEAL;
            else if (near && !seen) fill = RED;
            return <circle key={i} cx={sx(b.x)} cy={sy(b.y)} r={near ? 3.4 : 2} fill={fill} />;
          })}
          <circle cx={sx(user.x)} cy={sy(user.y)} r={5} fill={COBALT} stroke="#fff" strokeWidth={1.5} />
        </svg>
      </Panel>
      <div className="flex flex-col gap-5">
        <Toggle label="search the 8 neighbour cells too" checked={neighbours} onChange={setNeighbours} />
        <div className="grid grid-cols-2 gap-x-6">
          <Stat label="nearby found" value={`${found}`} accent sub="returned by the query" />
          <Stat label="nearby missed" value={`${missed}`} sub={missed ? "just over a cell edge" : "none - full coverage"} />
        </div>
        <Callout label="// the boundary problem" tone={missed ? "warn" : "info"}>
          Two points can be metres apart yet sit in different geohash cells - and
          near the equator or prime meridian they may share <em>no</em> prefix at
          all. Searching only the user&apos;s own cell silently drops the{" "}
          <span style={{ color: RED }} className="font-semibold">red</span>{" "}
          businesses across the border. The fix: always fetch the current cell{" "}
          <strong>plus its eight neighbours</strong>, computed in constant time
          from the geohash.
        </Callout>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 7. Animated quadtree build                                   *
 * ============================================================ */
type QRect = { x0: number; y0: number; x1: number; y1: number };
type Leaf = { rect: QRect; count: number; depth: number };

function buildQuad(pts: Pt[], cap: number, maxDepth: number): Leaf[] {
  const out: Leaf[] = [];
  function rec(rect: QRect, inside: Pt[], depth: number) {
    if (inside.length <= cap || depth >= maxDepth) {
      out.push({ rect, count: inside.length, depth });
      return;
    }
    const mx = (rect.x0 + rect.x1) / 2;
    const my = (rect.y0 + rect.y1) / 2;
    const quads: QRect[] = [
      { x0: rect.x0, y0: rect.y0, x1: mx, y1: my },
      { x0: mx, y0: rect.y0, x1: rect.x1, y1: my },
      { x0: rect.x0, y0: my, x1: mx, y1: rect.y1 },
      { x0: mx, y0: my, x1: rect.x1, y1: rect.y1 },
    ];
    for (const q of quads) {
      const sub = inside.filter((p) => p.x >= q.x0 && p.x < q.x1 && p.y >= q.y0 && p.y < q.y1);
      rec(q, sub, depth + 1);
    }
  }
  rec({ x0: 0, y0: 0, x1: 1, y1: 1 }, pts, 0);
  return out;
}

function Quadtree() {
  const businesses = useMemo(() => makeBusinesses(200, 5), []);
  const [cap, setCap] = useState(6);
  const [depth, setDepth] = useState(0);
  const [running, setRunning] = useState(false);

  const fullLeaves = useMemo(() => buildQuad(businesses, cap, 8), [businesses, cap]);
  const maxDepthReached = useMemo(() => Math.max(...fullLeaves.map((l) => l.depth)), [fullLeaves]);
  const leaves = useMemo(() => buildQuad(businesses, cap, depth), [businesses, cap, depth]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setDepth((d) => {
        if (d >= maxDepthReached) {
          window.clearInterval(id);
          setRunning(false);
          return d;
        }
        return d + 1;
      });
    }, 520);
    return () => window.clearInterval(id);
  }, [running, maxDepthReached]);

  function build() {
    setDepth(0);
    setRunning(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Panel tone="stone" className="p-5">
        <svg viewBox="0 0 300 300" className="w-full" role="img" aria-label="Quadtree subdivision adapting to density">
          <rect x={0} y={0} width={S} height={S} rx={8} fill="#fff" stroke="var(--hairline-light)" />
          {leaves.map((l, i) => {
            const overfull = l.count > cap;
            return (
              <rect
                key={i}
                x={sx(l.rect.x0)}
                y={sy(l.rect.y1)}
                width={(l.rect.x1 - l.rect.x0) * S}
                height={(l.rect.y1 - l.rect.y0) * S}
                fill={overfull ? "rgba(226,59,74,0.10)" : "rgba(0,168,126,0.07)"}
                stroke={overfull ? RED : TEAL}
                strokeWidth={1}
                strokeOpacity={0.7}
              />
            );
          })}
          {businesses.map((b, i) => (
            <circle key={i} cx={sx(b.x)} cy={sy(b.y)} r={1.7} fill="rgba(25,28,31,0.55)" />
          ))}
        </svg>
      </Panel>
      <div className="flex flex-col gap-5">
        <Slider label="max businesses per node (capacity)" min={2} max={20} value={cap} onChange={(v) => { setCap(v); setDepth(0); }} />
        <div className="flex items-center gap-3">
          <ActionButton onClick={build} disabled={running}>
            {running ? "splitting…" : "Build the tree"}
          </ActionButton>
          <span className="font-mono text-[13px] text-[var(--slate)]">depth {depth}/{maxDepthReached}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6">
          <Stat label="leaf nodes" value={`${leaves.length}`} accent sub="grids at this depth" />
          <Stat label="still over capacity" value={`${leaves.filter((l) => l.count > cap).length}`} sub="red = needs another split" />
        </div>
        <Callout label="// quadtree carves to fit" tone="key">
          Start with one node for the whole map. Any node holding more than the
          capacity splits into four children; repeat until every leaf is under
          capacity. Dense downtown areas keep splitting into tiny cells while
          empty regions stay as one big node - the index <strong>adapts to the
          data</strong>. It lives in memory, so it&apos;s rebuilt on startup
          (~minutes for 200M businesses) and updated carefully as businesses come
          and go.
        </Callout>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 8. Geohash vs quadtree + S2 / Hilbert curve                  *
 * ============================================================ */
function Comparison() {
  const rows = [
    { f: "Implementation", gh: "Trivial - just a function", qt: "Harder - build & balance a tree" },
    { f: "Adapts to density", gh: "No - fixed grid per length", qt: "Yes - splits where it's dense" },
    { f: "k-nearest", gh: "Awkward - widen the prefix", qt: "Natural - walk up the tree" },
    { f: "Updates", gh: "Cheap - edit one row", qt: "Costly - may re-split / rebalance" },
    { f: "Used by", gh: "Redis, MongoDB, Lyft, Bing", qt: "Yelp" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <Panel className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-px bg-[var(--hairline-light)] text-[14px]">
          <div className="bg-white p-3 font-mono text-[12px] uppercase tracking-wide text-[var(--muted)]"> </div>
          <div className="bg-white p-3 font-mono text-[12px] uppercase tracking-wide text-[var(--primary)]">Geohash</div>
          <div className="bg-white p-3 font-mono text-[12px] uppercase tracking-wide text-[var(--accent-teal)]">Quadtree</div>
          {rows.map((r) => (
            <Row key={r.f} r={r} />
          ))}
        </div>
      </Panel>
      <Callout label="// google s2 & the hilbert curve" tone="info">
        S2 takes a third route: it threads a <strong>Hilbert space-filling
        curve</strong> through the sphere, flattening 2D space into a single 1D
        index where points close on the ground stay close on the line. Because
        it can cover arbitrary regions at mixed resolutions, it powers{" "}
        <strong>geofencing</strong> - alerting users the moment they cross into a
        defined area - which is why Google Maps and Tinder use it.
      </Callout>
      <HilbertCurve />
    </div>
  );
}

function Row({ r }: { r: { f: string; gh: string; qt: string } }) {
  return (
    <>
      <div className="bg-white p-3 text-[var(--ink)]">{r.f}</div>
      <div className="bg-white p-3 text-[var(--slate)]">{r.gh}</div>
      <div className="bg-white p-3 text-[var(--slate)]">{r.qt}</div>
    </>
  );
}

// A little animated Hilbert curve: order grows, the line stays continuous.
function hilbertPoints(order: number): [number, number][] {
  const nn = 1 << order;
  const total = nn * nn;
  const pts: [number, number][] = [];
  for (let d = 0; d < total; d++) {
    let rx,
      ry,
      t = d;
    let x = 0,
      y = 0;
    for (let s = 1; s < nn; s *= 2) {
      rx = 1 & (t / 2);
      ry = 1 & (t ^ rx);
      // rotate
      if (ry === 0) {
        if (rx === 1) {
          x = s - 1 - x;
          y = s - 1 - y;
        }
        [x, y] = [y, x];
      }
      x += s * rx;
      y += s * ry;
      t = Math.floor(t / 4);
    }
    pts.push([x, y]);
  }
  return pts;
}

function HilbertCurve() {
  const [order, setOrder] = useState(2);
  useEffect(() => {
    const id = window.setInterval(() => setOrder((o) => (o >= 5 ? 1 : o + 1)), 1400);
    return () => window.clearInterval(id);
  }, []);
  const pts = useMemo(() => hilbertPoints(order), [order]);
  const nn = 1 << order;
  const step = S / nn;
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${(x + 0.5) * step} ${(nn - 1 - y + 0.5) * step}`).join(" ");
  return (
    <Panel tone="stone" className="flex flex-col items-center gap-2 p-5">
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px]" role="img" aria-label="A Hilbert space-filling curve">
        <rect x={0} y={0} width={S} height={S} rx={8} fill="#fff" stroke="var(--hairline-light)" />
        <path d={path} fill="none" stroke={COBALT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <p className="font-mono text-[12px] text-[var(--stone-text)]">Hilbert curve, order {order} - one continuous 1D thread through 2D space</p>
    </Panel>
  );
}

/* ============================================================ *
 * 9. Scaling the storage layer                                 *
 * ============================================================ */
function ScaleLayer() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Panel className="p-6">
          <p className="mono-label text-[var(--primary)]">business table</p>
          <p className="mt-3 text-[14px] leading-[1.6] text-[var(--slate)]">
            The source of truth for each business (name, address, lat/lng). Too
            big for one server, so <strong>shard by business_id</strong> - an even
            split that&apos;s easy to operate.
          </p>
        </Panel>
        <Panel className="p-6">
          <p className="mono-label text-[var(--accent-teal)]">geospatial index table</p>
          <p className="mt-3 text-[14px] leading-[1.6] text-[var(--slate)]">
            Maps <code className="font-mono text-[13px]">geohash → business_ids</code>. Store{" "}
            <strong>one row per (geohash, business_id)</strong> rather than a JSON
            blob, so adds and removes lock a single row. It&apos;s small (~2 GB),
            so a read replica per region is plenty - no sharding needed.
          </p>
        </Panel>
      </div>
      <Callout label="// caching & regions" tone="key">
        The workload is overwhelmingly reads, but don&apos;t cache reflexively -
        the index already fits in memory and the DB serves it fast. When you do,
        cache <code className="font-mono text-[13px]">geohash → list of business_ids</code>{" "}
        and the business objects in Redis, keyed by id. Deploy the read path
        per <strong>region / availability zone</strong> so users hit a copy
        close to them, and to satisfy data-privacy rules (GDPR, CCPA) about where
        location data lives.
      </Callout>
    </div>
  );
}

/* ============================================================ *
 * Page                                                          *
 * ============================================================ */
export default function ProximityService() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-5">
        <Note>
          A proximity service answers one deceptively hard question: given my{" "}
          <strong>(latitude, longitude)</strong> and a radius, which businesses
          are nearby? At 100M daily users that&apos;s ~5,000 searches a second
          against 200M businesses. The whole design is a hunt for the right{" "}
          <strong>spatial index</strong> - the data structure that turns &ldquo;scan
          the planet&rdquo; into &ldquo;look in this cell&rdquo;.
        </Note>
        <div className="grid gap-x-6 sm:grid-cols-3">
          <Stat label="daily active users" value="100M" />
          <Stat label="search QPS" value="~5,000" sub="5 searches/user/day" />
          <Stat label="businesses" value="200M" accent />
        </div>
      </div>

      <section className="flex flex-col gap-6">
        <SectionLabel step="01">The naive scan</SectionLabel>
        <Note>
          Before any index, the obvious query draws a box around the user and
          scans every business inside. Run it and watch how many rows it has to
          touch to return a handful.
        </Note>
        <NaiveScan />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="02">Two families of spatial index</SectionLabel>
        <Note>
          Every option does the same thing - divide the map into smaller areas
          and index those - but splits into two camps: hash a point to a fixed
          cell, or build a tree that adapts to the data.
        </Note>
        <Taxonomy />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="03">Evenly divided grid</SectionLabel>
        <Note>
          The simplest index: chop the world into equal squares. It works until
          you remember the world isn&apos;t evenly populated.
        </Note>
        <EvenGrid />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="04">Geohash</SectionLabel>
        <Note>
          Geohash encodes a location as a short string by recursively halving the
          world and interleaving longitude and latitude bits. Click the map and
          drag the precision up to watch the cell shrink and the code grow.
        </Note>
        <GeohashEncoder />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="05">Radius to precision</SectionLabel>
        <Note>
          A search radius maps to a geohash length: the shortest code whose cell
          still covers the circle.
        </Note>
        <RadiusMapping />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="06">The boundary problem</SectionLabel>
        <Note>
          Geohash&apos;s prefix trick has a catch at cell edges. Here the user
          sits right on a corner - watch what a single-cell lookup misses.
        </Note>
        <BoundaryProblem />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="07">Quadtree</SectionLabel>
        <Note>
          Instead of a fixed grid, recursively split any region that holds too
          many businesses. Build it and watch the cells cluster exactly where the
          data is dense.
        </Note>
        <Quadtree />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="08">Geohash vs quadtree vs S2</SectionLabel>
        <Comparison />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="09">Scaling the storage</SectionLabel>
        <Note>
          With the index chosen, the rest is plumbing: a sharded source-of-truth
          table, a small geospatial index table, a read-heavy cache, and regional
          replicas.
        </Note>
        <ScaleLayer />
      </section>

      <Note>
        That&apos;s the whole chapter: turn an impossible full-table scan into a
        cell lookup. Geohash and quadtree are the workhorses; S2 is the
        specialist for geofencing. Everything else - sharding, caching, regions -
        is there to serve that one lookup fast, everywhere, all the time.
      </Note>
    </div>
  );
}
