"use client";

// Nearby friends (Alex Xu vol.2, ch.2) - a real-time location feature. Each
// concept in the chapter gets an animated panel: the QPS math, peer-to-peer vs
// a shared backend, the live 5-mile geofence, the periodic-update pipeline
// (WebSocket + Redis Pub/Sub + history DB), the per-user Pub/Sub channel
// fan-out, sharding channels across a Pub/Sub cluster with a consistent-hash
// ring, and how each component scales. Light illustration surfaces:
// teal = in range / delivered, cobalt = active, danger-red = out of range /
// dropped.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionButton,
  Callout,
  Note,
  Panel,
  Segmented,
  Slider,
  Stat,
} from "@/components/lab/ui";

const TEAL = "#00a87e";
const COBALT = "#494fdf";
const RED = "#e23b4a";
const AMBER = "#ec7e00";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Well-mixed string hash -> a position in [0,1) on the ring. Plain FNV-1a
// clusters badly on near-identical short names ("srv-0", "srv-1", ...) - the
// trailing char barely moves the high bits, so every server collapses onto the
// same point and the ring stops working. This avalanches (xmur3 + a finalizer)
// so similar names scatter evenly, which is what a real hash like SHA-1 does.
function hashPos(str: string): number {
  let h = (1779033703 ^ str.length) >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// ---- ring geometry (12 o'clock = 0, clockwise) ----
const RING_CX = 150;
const RING_CY = 150;
const TAU = Math.PI * 2;
function ringPt(p: number, r: number): [number, number] {
  const a = p * TAU - Math.PI / 2;
  return [RING_CX + r * Math.cos(a), RING_CY + r * Math.sin(a)];
}
function ringArc(a: number, b: number, r: number): string {
  const [x1, y1] = ringPt(a, r);
  const [x2, y2] = ringPt(b, r);
  let span = b - a;
  if (span < 0) span += 1;
  const large = span > 0.5 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function SectionLabel({ step, children }: { step: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[13px] font-semibold text-[var(--primary)]">{step}</span>
      <h2 className="heading text-[clamp(1.4rem,3vw,1.9rem)] text-[var(--ink)]">{children}</h2>
    </div>
  );
}

/* ============================================================ *
 * 1. Peer-to-peer mesh vs shared backend                       *
 * ============================================================ */
function MeshVsBackend() {
  const [mode, setMode] = useState<"p2p" | "backend">("p2p");
  const [friends, setFriends] = useState(6);

  const S = 300;
  const cx = 150;
  const cy = 150;
  const R = 110;
  const nodes = useMemo(
    () =>
      Array.from({ length: friends }, (_, i) => {
        const a = (i / friends) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
      }),
    [friends]
  );

  // p2p: complete graph over user + friends. backend: star through the hub.
  const p2pEdges = ((friends + 1) * friends) / 2;
  const backendEdges = friends;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Panel tone="stone" className="p-5">
        <svg viewBox="0 0 300 300" className="w-full" role="img" aria-label="Peer-to-peer mesh versus shared backend topology">
          {mode === "p2p" ? (
            <>
              {/* edges between every pair (incl. centre user) */}
              {nodes.map((n, i) => (
                <g key={i}>
                  <line x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="rgba(226,59,74,0.4)" strokeWidth={1} />
                  {nodes.slice(i + 1).map((m, j) => (
                    <line key={j} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="rgba(226,59,74,0.3)" strokeWidth={1} />
                  ))}
                </g>
              ))}
            </>
          ) : (
            <>
              {/* star through hub */}
              {nodes.map((n, i) => (
                <line key={i} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="rgba(0,168,126,0.55)" strokeWidth={1.4} />
              ))}
              <rect x={cx - 22} y={cy - 14} width={44} height={28} rx={6} fill={TEAL} />
              <text x={cx} y={cy + 4} textAnchor="middle" className="font-mono" fontSize={9} fill="#fff">
                backend
              </text>
            </>
          )}
          {/* friend nodes */}
          {nodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={7} fill="#fff" stroke={mode === "p2p" ? RED : TEAL} strokeWidth={2} />
          ))}
          {/* central user (only drawn as node in p2p; in backend the hub is the box) */}
          {mode === "p2p" && <circle cx={cx} cy={cy} r={8} fill={COBALT} stroke="#fff" strokeWidth={2} />}
        </svg>
      </Panel>
      <div className="flex flex-col gap-5">
        <Segmented
          label="topology"
          value={mode}
          onChange={setMode}
          options={[
            { value: "p2p", label: "Peer-to-peer" },
            { value: "backend", label: "Shared backend" },
          ]}
        />
        <Slider label="nearby friends" min={2} max={14} value={friends} onChange={setFriends} />
        <div className="grid grid-cols-2 gap-x-6">
          <Stat label="connections held" value={`${mode === "p2p" ? p2pEdges : backendEdges}`} accent={mode === "backend"} sub={mode === "p2p" ? "grows ~ n²" : "grows linearly"} />
          <Stat label="on a phone?" value={mode === "p2p" ? "no" : "yes"} sub={mode === "p2p" ? "battery & flaky links" : "one stable socket"} />
        </div>
        <Callout label={mode === "p2p" ? "// why p2p fails on mobile" : "// the shared backend"} tone={mode === "p2p" ? "warn" : "key"}>
          {mode === "p2p" ? (
            <>
              Every phone would hold a direct connection to every nearby friend -
              a mesh that grows roughly with the <strong>square</strong> of the
              group. On a mobile network with flaky links and a tight battery
              budget, that&apos;s a non-starter.
            </>
          ) : (
            <>
              Route everything through a backend instead. Each phone holds{" "}
              <strong>one</strong> connection. The backend receives a location
              update, figures out which friends are close enough to care, and
              forwards it to just them. One socket per user, work centralised
              where it can scale.
            </>
          )}
        </Callout>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 2. The live 5-mile geofence                                  *
 * ============================================================ */
type Friend = { x: number; y: number; name: string };

function LiveMap() {
  const friends = useMemo<Friend[]>(() => {
    const rnd = mulberry32(42);
    const names = ["Ava", "Ben", "Cole", "Dia", "Eli", "Fay", "Gus", "Ivy", "Jax", "Kai"];
    return names.map((name) => ({ name, x: 0.1 + rnd() * 0.8, y: 0.1 + rnd() * 0.8 }));
  }, []);

  const [radius, setRadius] = useState(0.22);
  const [t, setT] = useState(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) return;
    const id = window.setInterval(() => setT((v) => v + 0.02), 40);
    return () => window.clearInterval(id);
  }, []);

  // user gently wanders on a lissajous path
  const S = 300;
  const user = { x: 0.5 + 0.16 * Math.sin(t), y: 0.5 + 0.12 * Math.sin(t * 1.4) };
  const sx = (x: number) => x * S;
  const sy = (y: number) => (1 - y) * S;
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

  // expanding "location broadcast" ping every cycle
  const ping = (t * 0.5) % 1;
  const inRange = friends.filter((f) => dist(f, user) <= radius);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Panel tone="stone" className="p-5">
        <svg viewBox="0 0 300 300" className="w-full" role="img" aria-label="A user moving with a 5-mile geofence over their friends">
          <rect x={0} y={0} width={S} height={S} rx={8} fill="#fff" stroke="var(--hairline-light)" />
          {/* radius */}
          <circle cx={sx(user.x)} cy={sy(user.y)} r={radius * S} fill="rgba(0,168,126,0.07)" stroke={TEAL} strokeWidth={1.4} strokeDasharray="5 3" />
          {/* broadcast ping */}
          {!reduce.current && (
            <circle cx={sx(user.x)} cy={sy(user.y)} r={ping * radius * S} fill="none" stroke={COBALT} strokeWidth={1.5} opacity={1 - ping} />
          )}
          {/* friends */}
          {friends.map((f, i) => {
            const near = dist(f, user) <= radius;
            return (
              <g key={i}>
                <circle cx={sx(f.x)} cy={sy(f.y)} r={near ? 6 : 4.5} fill={near ? TEAL : "var(--hairline)"} stroke="#fff" strokeWidth={1.5} />
                <text x={sx(f.x)} y={sy(f.y) - 9} textAnchor="middle" className="font-mono" fontSize={8} fill={near ? "var(--accent-teal)" : "var(--muted)"}>
                  {f.name}
                </text>
              </g>
            );
          })}
          {/* user */}
          <circle cx={sx(user.x)} cy={sy(user.y)} r={6.5} fill={COBALT} stroke="#fff" strokeWidth={2} />
        </svg>
      </Panel>
      <div className="flex flex-col gap-5">
        <Slider label="search radius (~5 mi)" min={0.12} max={0.4} step={0.01} value={radius} onChange={setRadius} display={`${Math.round((radius / 0.22) * 5)} mi`} />
        <div className="grid grid-cols-2 gap-x-6">
          <Stat label="friends in range" value={`${inRange.length}`} accent sub="receive your updates" />
          <Stat label="filtered out" value={`${friends.length - inRange.length}`} sub="too far - nothing sent" />
        </div>
        <Callout label="// the core rule" tone="key">
          As you move, your location is pushed only to friends within the radius -
          the <span style={{ color: TEAL }} className="font-semibold">teal</span>{" "}
          ones. Everyone else is filtered out at the backend, so a distant
          friend&apos;s phone never wakes up. The feature is just this rule,
          applied to a stream of updates roughly every 30 seconds.
        </Callout>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 3. The periodic location-update pipeline                     *
 * ============================================================ */
type Stage = { id: string; label: string; detail: string; kind: "node" | "store" | "bus" | "gate" };

const STAGES: Stage[] = [
  { id: "phone", label: "Your phone", detail: "sends {lat, lng, t} over its WebSocket every ~30s", kind: "node" },
  { id: "lb", label: "Load balancer", detail: "routes to the WebSocket server holding your session", kind: "node" },
  { id: "ws", label: "WebSocket server", detail: "stateful - keeps your live connection open", kind: "node" },
  { id: "hist", label: "Location history DB", detail: "append the new position (Cassandra)", kind: "store" },
  { id: "pub", label: "Redis Pub/Sub", detail: "publish to YOUR channel - friends are subscribed", kind: "bus" },
  { id: "sub", label: "Friends' WS handlers", detail: "every subscribed friend's connection gets the message", kind: "node" },
  { id: "gate", label: "Distance ≤ 5 mi?", detail: "each handler checks range - forward only if inside", kind: "gate" },
  { id: "friend", label: "Friend's phone", detail: "in-range friends see your pin move; others get nothing", kind: "node" },
];

function Pipeline() {
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setActive((a) => {
        if (a >= STAGES.length - 1) {
          window.clearInterval(id);
          setRunning(false);
          return a;
        }
        return a + 1;
      });
    }, 900);
    return () => window.clearInterval(id);
  }, [running]);

  function play() {
    setActive(0);
    setRunning(true);
  }

  const kindColor = (k: Stage["kind"]) =>
    k === "store" ? AMBER : k === "bus" ? COBALT : k === "gate" ? RED : TEAL;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ActionButton onClick={play} disabled={running}>
          {running ? "flowing…" : "Send a location update"}
        </ActionButton>
        <span className="font-mono text-[13px] text-[var(--slate)]">
          {active < 0 ? "idle" : `step ${active + 1}/${STAGES.length}`}
        </span>
      </div>
      <div className="flex flex-col gap-0">
        {STAGES.map((s, i) => {
          const on = i <= active;
          const isActive = i === active;
          const color = kindColor(s.kind);
          return (
            <div key={s.id} className="flex flex-col">
              <div
                className="flex items-start gap-4 rounded-[12px] p-4 transition-all"
                style={{
                  background: isActive ? "rgba(73,79,223,0.06)" : on ? "rgba(0,168,126,0.04)" : "var(--stone)",
                  outline: isActive ? `1.5px solid ${color}` : "none",
                  opacity: on ? 1 : 0.5,
                }}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-semibold text-white transition-colors"
                  style={{ background: on ? color : "var(--hairline-strong)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-[15px] font-medium text-[var(--ink)]">
                    {s.label}
                    {s.kind === "store" && <span className="ml-2 font-mono text-[11px] text-[var(--accent-warning)]">persist</span>}
                    {s.kind === "bus" && <span className="ml-2 font-mono text-[11px] text-[var(--primary)]">fan-out</span>}
                    {s.kind === "gate" && <span className="ml-2 font-mono text-[11px] text-[var(--accent-danger)]">filter</span>}
                  </p>
                  <p className="mt-0.5 text-[13.5px] leading-[1.5] text-[var(--slate)]">{s.detail}</p>
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div className="ml-[27px] h-4 w-px" style={{ background: i < active ? kindColor(STAGES[i + 1].kind) : "var(--hairline-light)" }} />
              )}
            </div>
          );
        })}
      </div>
      <Callout label="// two jobs at the WebSocket server" tone="key">
        When your update lands it does two things at once: <strong>append</strong>{" "}
        it to the history database (for later use), and <strong>publish</strong>{" "}
        it to your personal Redis Pub/Sub channel. Your friends&apos; WebSocket
        connections are subscribed to that channel, so they receive it instantly -
        then each one runs the distance check and only forwards to friends still
        in range.
      </Callout>
    </div>
  );
}

/* ============================================================ *
 * 4. Redis Pub/Sub channel fan-out                             *
 * ============================================================ */
function PubSubFanout() {
  const [pulse, setPulse] = useState(0);
  const subs = ["User 2", "User 3", "User 4", "User 5"];
  const inRange = [true, true, false, true]; // who is currently within radius

  useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => p + 1), 2200);
    return () => window.clearInterval(id);
  }, []);

  const S = 300;
  const pubY = 40;
  const chY = 130;
  const subY = 250;
  const pubX = 150;
  const subX = subs.map((_, i) => 40 + (i * (S - 80)) / (subs.length - 1));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Panel tone="stone" className="p-5">
        <svg viewBox="0 0 300 300" className="w-full" key={pulse} role="img" aria-label="Redis Pub/Sub fan-out from a user's channel to subscribers">
          {/* publisher -> channel */}
          <line x1={pubX} y1={pubY + 14} x2={pubX} y2={chY - 14} stroke="var(--hairline-strong)" strokeWidth={1.4} />
          {/* channel -> subs */}
          {subX.map((x, i) => (
            <line key={i} x1={pubX} y1={chY + 14} x2={x} y2={subY - 16} stroke={inRange[i] ? TEAL : "var(--hairline)"} strokeWidth={1.4} strokeDasharray={inRange[i] ? "0" : "3 3"} />
          ))}
          {/* animated message dots on each edge */}
          {subX.map((x, i) => (
            <circle key={i} r={4} fill={inRange[i] ? TEAL : RED}>
              <animate attributeName="cx" from={pubX} to={x} dur="1.1s" begin="0.3s" fill="freeze" />
              <animate attributeName="cy" from={chY + 14} to={subY - 16} dur="1.1s" begin="0.3s" fill="freeze" />
              <animate attributeName="opacity" from="1" to={inRange[i] ? "1" : "0.2"} dur="1.1s" begin="0.3s" fill="freeze" />
            </circle>
          ))}
          {/* publish dot */}
          <circle r={4} fill={COBALT} cx={pubX}>
            <animate attributeName="cy" from={pubY + 14} to={chY - 14} dur="0.3s" fill="freeze" />
          </circle>
          {/* publisher */}
          <rect x={pubX - 40} y={pubY - 14} width={80} height={28} rx={6} fill={COBALT} />
          <text x={pubX} y={pubY + 4} textAnchor="middle" className="font-mono" fontSize={10} fill="#fff">User 1</text>
          {/* channel */}
          <rect x={pubX - 64} y={chY - 15} width={128} height={30} rx={8} fill="#fff" stroke={COBALT} strokeWidth={1.5} />
          <text x={pubX} y={chY + 4} textAnchor="middle" className="font-mono" fontSize={10} fill="var(--primary)">user-1 channel</text>
          {/* subscribers */}
          {subX.map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={subY} r={11} fill="#fff" stroke={inRange[i] ? TEAL : "var(--hairline-strong)"} strokeWidth={1.8} />
              <text x={x} y={subY + 26} textAnchor="middle" className="font-mono" fontSize={8} fill={inRange[i] ? "var(--accent-teal)" : "var(--muted)"}>{subs[i]}</text>
            </g>
          ))}
        </svg>
      </Panel>
      <div className="flex flex-col gap-5">
        <Callout label="// a channel per user" tone="key">
          Each active user gets one Redis Pub/Sub channel. Their friends&apos;
          WebSocket handlers <strong>subscribe</strong> to it. When a location
          update is published, Redis fans it out to every subscriber at once - no
          loop over a friend list, no database hit. The message lives only in
          memory for that instant; it&apos;s never stored in the bus.
        </Callout>
        <Callout label="// still filtered at the edge" tone="info">
          Pub/Sub delivers to <em>all</em> subscribers; the per-friend distance
          check then drops anyone now out of range (the dashed{" "}
          <span style={{ color: RED }} className="font-semibold">red</span>{" "}
          edge). Subscription is cheap, so a friend coming online or moving in
          range just adds a subscriber.
        </Callout>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 5. Sharding channels across a Pub/Sub cluster (ring)         *
 * ============================================================ */
const RING_COLORS = [COBALT, TEAL, AMBER, "#7c5cff", "#0891b2"];

const R = 100;

function PubSubRing() {
  const [servers, setServers] = useState(4);
  const channels = useMemo(() => Array.from({ length: 14 }, (_, i) => `chan-${i}`), []);
  const [moved, setMoved] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const reduced = useRef(false);

  const serverPts = useMemo(
    () => Array.from({ length: servers }, (_, s) => ({ s, p: hashPos(`srv-${s}`) })).sort((a, b) => a.p - b.p),
    [servers]
  );

  // A channel is handled by the first server clockwise from its hash position.
  const ownerOf = (p: number, pts: { s: number; p: number }[]) => {
    for (const pt of pts) if (pt.p >= p) return pt.s;
    return pts.length ? pts[0].s : 0; // wrap past 12 o'clock
  };

  const assignment = useMemo(() => {
    const m: Record<string, number> = {};
    for (const ch of channels) m[ch] = ownerOf(hashPos(ch), serverPts);
    return m;
  }, [channels, serverPts]);

  // Each server is responsible for the hash range from the previous server
  // (clockwise) up to itself - the coloured arc in the book's Figure 2.9.
  const arcs = useMemo(() => {
    if (serverPts.length <= 1) return [];
    return serverPts.map((pt, i) => {
      const prev = serverPts[(i - 1 + serverPts.length) % serverPts.length];
      return { from: prev.p, to: pt.p, server: pt.s };
    });
  }, [serverPts]);

  const counts = useMemo(() => {
    const c = new Array(servers).fill(0);
    for (const ch of channels) c[assignment[ch]]++;
    return c;
  }, [assignment, servers, channels]);
  const maxCount = Math.max(1, ...counts);

  // The routing pulse: cycle through channels, showing each one being published
  // to its server. Honours reduced-motion (then it just rests on one channel).
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2000);
    return () => window.clearInterval(id);
  }, []);

  const routed = channels[tick % channels.length];
  const routedOwner = assignment[routed];
  const routedChanP = hashPos(routed);
  const routedServerP = serverPts.find((s) => s.s === routedOwner)?.p ?? 0;
  const routeD = ringArc(routedChanP, routedServerP, R);

  function change(next: number) {
    const before: Record<string, number> = { ...assignment };
    const afterPts = Array.from({ length: next }, (_, s) => ({ s, p: hashPos(`srv-${s}`) })).sort((a, b) => a.p - b.p);
    const m = new Set<string>();
    for (const ch of channels) if (before[ch] !== ownerOf(hashPos(ch), afterPts)) m.add(ch);
    setMoved(m);
    setServers(next);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <Panel tone="stone" className="flex flex-col items-center gap-3 p-5">
        <svg viewBox="0 0 300 300" className="w-full max-w-[340px]" role="img" aria-label="Consistent-hash ring: channels routed to the first Pub/Sub server clockwise">
          {/* base track */}
          <circle cx={RING_CX} cy={RING_CY} r={R} fill="none" stroke="var(--hairline-light)" strokeWidth={12} />
          {/* each server's responsible hash range */}
          {serverPts.length <= 1 ? (
            <circle cx={RING_CX} cy={RING_CY} r={R} fill="none" stroke={RING_COLORS[serverPts[0]?.s ?? 0]} strokeWidth={12} strokeOpacity={0.5} />
          ) : (
            arcs.map((a, i) => (
              <path key={i} d={ringArc(a.from, a.to, R)} fill="none" stroke={RING_COLORS[a.server]} strokeWidth={12} strokeOpacity={a.server === routedOwner ? 0.85 : 0.4} />
            ))
          )}
          {/* the dashed "walk clockwise to your server" arc for the routed channel */}
          <path d={routeD} fill="none" stroke={RING_COLORS[routedOwner]} strokeWidth={2} strokeDasharray="3 3" opacity={0.95} />
          {/* server nodes + labels (p1..pN) */}
          {serverPts.map((pt) => {
            const [x, y] = ringPt(pt.p, R);
            const [lx, ly] = ringPt(pt.p, R + 23);
            const hot = pt.s === routedOwner;
            return (
              <g key={pt.s}>
                {hot && <circle cx={x} cy={y} r={11} fill="none" stroke={RING_COLORS[pt.s]} strokeWidth={1.5} opacity={0.6} />}
                <circle cx={x} cy={y} r={7} fill={RING_COLORS[pt.s]} stroke="#fff" strokeWidth={2} />
                <text x={lx} y={ly + 3.5} textAnchor="middle" className="font-mono" fontSize={11} fontWeight={600} fill={RING_COLORS[pt.s]}>p{pt.s + 1}</text>
              </g>
            );
          })}
          {/* channels */}
          {channels.map((ch) => {
            const [x, y] = ringPt(hashPos(ch), R);
            const mv = moved.has(ch);
            const isRouted = ch === routed;
            return (
              <g key={ch}>
                {mv && <circle cx={x} cy={y} r={8} fill="none" stroke="var(--ink)" strokeWidth={1.4} className="lab-pop" />}
                {isRouted && <circle cx={x} cy={y} r={8} fill="none" stroke={RING_COLORS[routedOwner]} strokeWidth={1.8} />}
                <circle cx={x} cy={y} r={isRouted ? 4.5 : 3.4} fill={RING_COLORS[assignment[ch]]} stroke="#fff" strokeWidth={1.2} />
              </g>
            );
          })}
          {/* the location update travelling from channel to its server */}
          {!reduced.current && (
            <g key={tick}>
              <circle r={4.5} cx={0} cy={0} fill={RING_COLORS[routedOwner]} stroke="#fff" strokeWidth={1.5}>
                <animateMotion path={routeD} dur="1.3s" fill="freeze" />
              </circle>
            </g>
          )}
          {/* center label */}
          <text x={RING_CX} y={RING_CY - 4} textAnchor="middle" className="font-mono" fontSize={10} fill="var(--stone-text)">hash ring</text>
          <text x={RING_CX} y={RING_CY + 11} textAnchor="middle" className="font-mono" fontSize={9} fill="var(--stone-text)">channel → next server ↻</text>
        </svg>
        {/* routing caption - mirrors the book's two numbered steps */}
        <div className="text-center">
          <p className="font-mono text-[12.5px] text-[var(--ink)]">
            hash(<span className="font-semibold" style={{ color: RING_COLORS[routedOwner] }}>{routed}</span>) falls in <span className="font-semibold" style={{ color: RING_COLORS[routedOwner] }}>p{routedOwner + 1}</span>&apos;s range
          </p>
          <p className="mt-1 text-[12px] leading-[1.45] text-[var(--muted)]">
            a WebSocket server hashes the channel name, walks clockwise to the next
            server, and publishes the update there.
          </p>
        </div>
      </Panel>

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[var(--slate)]">Pub/Sub servers</span>
          <div className="flex items-center gap-2">
            <ActionButton variant="ghost" onClick={() => change(servers - 1)} disabled={servers <= 1}>- remove</ActionButton>
            <span className="w-6 text-center font-mono text-[16px] font-medium text-[var(--ink)]">{servers}</span>
            <ActionButton onClick={() => change(servers + 1)} disabled={servers >= 5}>+ add</ActionButton>
          </div>
        </div>

        {/* load per server - shows how lumpy ownership is without virtual nodes */}
        <Panel tone="stone" className="p-5">
          <p className="mono-label text-[var(--mute)]">channels handled per server</p>
          <div className="mt-3 flex flex-col gap-2">
            {Array.from({ length: servers }).map((_, s) => (
              <div key={s} className="flex items-center gap-2.5">
                <span className="w-6 font-mono text-[12px] font-semibold" style={{ color: RING_COLORS[s] }}>p{s + 1}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[var(--hairline-light)]">
                  <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${Math.max(3, (counts[s] / maxCount) * 100)}%`, background: RING_COLORS[s] }} />
                </div>
                <span className="w-6 text-right font-mono text-[12px] text-[var(--charcoal)]">{counts[s]}</span>
              </div>
            ))}
          </div>
        </Panel>

        {moved.size > 0 ? (
          <Callout label="// resharding" tone={moved.size > channels.length / 3 ? "warn" : "info"}>
            Only <strong>{moved.size} of {channels.length}</strong> channels changed
            owner (outlined on the ring). Every other channel kept its server, so
            its subscribers stay connected. The WebSocket servers pick up the new
            ring through service discovery and re-subscribe only the affected
            channels - no global reshuffle.
          </Callout>
        ) : (
          <Callout label="// why a ring, not modulo" tone="key">
            One Redis server can&apos;t fan out millions of updates a second, so the
            channels are spread across a <strong>cluster</strong>. Place each
            server and channel on a <strong>hash ring</strong> and a channel is
            owned by the first server clockwise. Add or remove a server and only
            the channels in <em>that one arc</em> move - with plain{" "}
            <code className="font-mono text-[13px]">hash % N</code> almost every
            channel would relocate. Add and remove servers and watch.
          </Callout>
        )}
        <Note>
          This is the same ring from the{" "}
          <a href="/lab/consistent-hashing" className="text-[var(--primary)] underline underline-offset-2">consistent hashing</a>{" "}
          lab (there with virtual nodes to even out the lumpy arcs you can see
          here), applied to Pub/Sub channels instead of cache keys.
        </Note>
      </div>
    </div>
  );
}

/* ============================================================ *
 * 6. Components & scale                                         *
 * ============================================================ */
function Components() {
  const comps = [
    { name: "WebSocket servers", tag: "stateful", color: TEAL, note: "Hold every user's live connection. Hard to scale down - draining means waiting for clients to drop. Auto-scale up on connection count." },
    { name: "API servers", tag: "stateless", color: COBALT, note: "Plain HTTP for auth, friends, profiles. Trivially auto-scaled behind the load balancer." },
    { name: "Redis location cache", tag: "TTL", color: AMBER, note: "Latest position per active user, with a TTL so stale users expire. The current location, not the history." },
    { name: "Redis Pub/Sub cluster", tag: "fan-out", color: COBALT, note: "The routing layer. CPU-bound, not memory-bound - shard by channel across the ring." },
    { name: "Location history DB", tag: "append", color: AMBER, note: "Every position over time (Cassandra). Write-heavy; shard by user id." },
    { name: "User database", tag: "graph", color: TEAL, note: "Profiles and the friend graph. The relational source of truth, replicated and sharded by user id." },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-x-6 sm:grid-cols-3">
        <Stat label="daily active users" value="100M" />
        <Stat label="location updates/sec" value="~334K" accent sub="every 30s, 10% online" />
        <Stat label="forwards/sec" value="~14M" sub="× ~40 nearby friends" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {comps.map((c) => (
          <Panel key={c.name} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium text-[var(--ink)]">{c.name}</p>
              <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white" style={{ background: c.color }}>{c.tag}</span>
            </div>
            <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--slate)]">{c.note}</p>
          </Panel>
        ))}
      </div>
      <Callout label="// the bottleneck is fan-out, not storage" tone="warn">
        The numbers say the strain is CPU at the Pub/Sub layer - 14M forwards a
        second - long before memory or the databases. So you scale the bus first,
        and you handle the rare super-connector (a user with 5,000 nearby
        friends) and the &ldquo;random nearby person&rdquo; feature with{" "}
        <strong>geohash channels</strong> instead of per-user ones.
      </Callout>
    </div>
  );
}

/* ============================================================ *
 * Page                                                          *
 * ============================================================ */
export default function NearbyFriends() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-5">
        <Note>
          &ldquo;Nearby friends&rdquo; shows which of your friends are within a{" "}
          <strong>5-mile radius right now</strong>, updating as everyone moves.
          Unlike a proximity service, the data never sits still - phones report
          their location every ~30 seconds, so the design is all about{" "}
          <strong>pushing a constant stream of updates to exactly the right
          people</strong>, fast.
        </Note>
      </div>

      <section className="flex flex-col gap-6">
        <SectionLabel step="01">Peer-to-peer, or a backend?</SectionLabel>
        <Note>
          The first fork: should phones talk directly to each other, or through a
          server? Toggle the topology and grow the friend group.
        </Note>
        <MeshVsBackend />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="02">The 5-mile geofence</SectionLabel>
        <Note>
          This is the feature in one picture: you move, and your location reaches
          only the friends inside the radius. Everyone else is filtered out.
        </Note>
        <LiveMap />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="03">The update pipeline</SectionLabel>
        <Note>
          Follow a single location update from your phone all the way to a
          friend&apos;s screen. Press play and watch it move through the system.
        </Note>
        <Pipeline />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="04">Redis Pub/Sub fan-out</SectionLabel>
        <Note>
          The heart of the design: a message bus that delivers one update to many
          subscribers without the publisher knowing who they are.
        </Note>
        <PubSubFanout />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="05">Sharding the channels</SectionLabel>
        <Note>
          Millions of channels won&apos;t fit on one Redis server, so they&apos;re
          spread across a cluster. Watch a publish event route itself: a
          channel hashes to a point on the ring, and whichever server owns that
          arc handles it. The pulse shows each channel finding its server; add or
          remove a server to see how few channels have to move.
        </Note>
        <PubSubRing />
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel step="06">Components & scale</SectionLabel>
        <Note>
          The full cast, and where the real pressure lands as you grow to 100M
          users.
        </Note>
        <Components />
      </section>

      <Note>
        The whole feature is a publish/subscribe loop wrapped in a distance
        check: WebSockets hold the live connections, Pub/Sub routes each update to
        the right channel, and the ring lets that bus scale. Get the fan-out
        right and the rest - history, profiles, caching - falls into place.
      </Note>
    </div>
  );
}
