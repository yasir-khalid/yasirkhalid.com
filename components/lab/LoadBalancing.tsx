"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButton, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

type Strategy = "round-robin" | "random" | "least-conn" | "weighted";

type ServerState = { active: number; handled: number };
type InFlight = { id: number; server: number; remaining: number };

const CAPACITY = 6; // visual "full" line per unit of weight
const TICK_MS = 650;
const AVG_DURATION = 3.5; // avg ticks a request occupies a server
const TICKS_PER_SEC = 1000 / TICK_MS;
const WEIGHT_PATTERN = [3, 2, 1, 2, 1, 1]; // per-server weights in weighted mode

function makeWeights(count: number, weighted: boolean): number[] {
  return Array.from({ length: count }, (_, i) =>
    weighted ? WEIGHT_PATTERN[i] ?? 1 : 1
  );
}

export default function LoadBalancing() {
  const [count, setCount] = useState(4);
  const [strategy, setStrategy] = useState<Strategy>("round-robin");
  const [running, setRunning] = useState(false);
  const [rate, setRate] = useState(3); // offered load, requests per tick
  const [rateLimit, setRateLimit] = useState(false);
  const [limit, setLimit] = useState(5); // accepted requests per tick when limiting
  const [servers, setServers] = useState<ServerState[]>(() =>
    Array.from({ length: 4 }, () => ({ active: 0, handled: 0 }))
  );
  const [flight, setFlight] = useState<InFlight[]>([]);
  const [pulse, setPulse] = useState<number | null>(null);
  const [rejected, setRejected] = useState(0);

  const rrRef = useRef(0);
  const idRef = useRef(0);
  const cwRef = useRef<number[]>([]); // smooth WRR current weights
  const rateRef = useRef(rate);
  const limitRef = useRef(limit);
  const rlRef = useRef(rateLimit);
  rateRef.current = rate;
  limitRef.current = limit;
  rlRef.current = rateLimit;
  const stateRef = useRef({ servers, flight });
  stateRef.current = { servers, flight };

  const weighted = strategy === "weighted";
  const weights = useMemo(() => makeWeights(count, weighted), [count, weighted]);
  const caps = useMemo(() => weights.map((w) => w * CAPACITY), [weights]);

  // Resize server array + reset WRR credits when count/strategy changes.
  useEffect(() => {
    setServers((prev) =>
      Array.from({ length: count }, (_, i) => prev[i] ?? { active: 0, handled: 0 })
    );
    setFlight((prev) => prev.filter((f) => f.server < count));
    rrRef.current = rrRef.current % count;
    cwRef.current = Array(count).fill(0);
  }, [count, strategy]);

  function pick(servers: ServerState[], w: number[]): number {
    if (strategy === "random") return Math.floor(Math.random() * servers.length);
    if (strategy === "least-conn") {
      // least connections, normalised by capacity so big servers take more
      let best = 0;
      let bestRatio = Infinity;
      servers.forEach((s, i) => {
        const ratio = s.active / (w[i] || 1);
        if (ratio < bestRatio) {
          bestRatio = ratio;
          best = i;
        }
      });
      return best;
    }
    if (strategy === "weighted") {
      // smooth weighted round-robin (the algorithm Nginx uses)
      const cw = cwRef.current;
      const total = w.reduce((a, b) => a + b, 0);
      let best = 0;
      for (let i = 0; i < servers.length; i++) {
        cw[i] = (cw[i] ?? 0) + w[i];
        if (cw[i] > (cw[best] ?? -Infinity)) best = i;
      }
      cw[best] -= total;
      return best;
    }
    // round-robin
    const i = rrRef.current % servers.length;
    rrRef.current = (rrRef.current + 1) % servers.length;
    return i;
  }

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const { servers, flight } = stateRef.current;
      const w = makeWeights(servers.length, strategy === "weighted");

      // 1. drain finished requests
      const drained: InFlight[] = [];
      const completedPerServer = new Array(servers.length).fill(0);
      flight.forEach((f) => {
        if (f.remaining <= 1) completedPerServer[f.server] += 1;
        else drained.push({ ...f, remaining: f.remaining - 1 });
      });

      // 2. offered load this tick (integer + fractional + burstiness)
      const r = rateRef.current;
      const base = Math.floor(r);
      const frac = r - base;
      const burst = Math.random() < 0.25 ? 1 : Math.random() < 0.15 ? -1 : 0;
      const offered = Math.max(0, base + (Math.random() < frac ? 1 : 0) + burst);

      // 3. rate limiter sheds anything above the cap
      const accepted = rlRef.current ? Math.min(offered, limitRef.current) : offered;
      const shed = offered - accepted;
      if (shed > 0) setRejected((x) => x + shed);

      // 4. route accepted requests
      const newReqs: InFlight[] = [];
      let lastServer = -1;
      for (let a = 0; a < accepted; a++) {
        const target = pick(servers, w);
        lastServer = target;
        newReqs.push({
          id: idRef.current++,
          server: target,
          remaining: 2 + Math.floor(Math.random() * 4),
        });
      }

      // 5. recompute server state
      const nextServers = servers.map((s, i) => {
        const added = newReqs.filter((req) => req.server === i).length;
        return {
          active: s.active - completedPerServer[i] + added,
          handled: s.handled + completedPerServer[i],
        };
      });

      setServers(nextServers);
      setFlight([...drained, ...newReqs]);
      if (lastServer >= 0) {
        setPulse(lastServer);
        setTimeout(() => setPulse(null), 250);
      }
    }, TICK_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, strategy, count]);

  function reset() {
    setRunning(false);
    setServers(Array.from({ length: count }, () => ({ active: 0, handled: 0 })));
    setFlight([]);
    setRejected(0);
    rrRef.current = 0;
    cwRef.current = Array(count).fill(0);
  }

  const totalHandled = servers.reduce((a, s) => a + s.handled, 0);
  const totalActive = servers.reduce((a, s) => a + s.active, 0);
  // Fairness: spread of handled counts (lower = fairer).
  const mean = totalHandled / servers.length || 0;
  const variance =
    servers.reduce((a, s) => a + (s.handled - mean) ** 2, 0) / servers.length;
  const spread = Math.sqrt(variance);

  // Traffic vs. capacity.
  const totalCapUnits = caps.reduce((a, c) => a + c, 0);
  const serviceCapacity = totalCapUnits / AVG_DURATION; // req / tick
  const acceptedRate = rateLimit ? Math.min(rate, limit) : rate;
  const utilization = acceptedRate / serviceCapacity;
  const offeredRps = rate * TICKS_PER_SEC;
  const acceptedRps = acceptedRate * TICKS_PER_SEC;
  const capacityRps = serviceCapacity * TICKS_PER_SEC;
  const utilPct = Math.round(utilization * 100);
  const overloaded = utilization > 1;
  const streamDots = Math.max(1, Math.min(14, Math.round(rate * 1.6)));

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A load balancer sits in front of a fleet of servers and decides where
        each incoming request goes. The goal: spread work so no single server
        drowns while others sit idle. The <strong>strategy</strong> it uses to
        choose matters once requests take varying time — and once servers
        aren&apos;t all the same size. Start the stream, turn up{" "}
        <strong>incoming traffic</strong>, and watch utilization climb toward —
        and past — 100%.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <Segmented<Strategy>
            label="balancing strategy"
            value={strategy}
            onChange={setStrategy}
            options={[
              { value: "round-robin", label: "Round-robin" },
              { value: "random", label: "Random" },
              { value: "least-conn", label: "Least conn" },
              { value: "weighted", label: "Weighted" },
            ]}
          />
          <div className="w-full max-w-[200px]">
            <Slider label="servers" min={2} max={6} value={count} onChange={setCount} />
          </div>
          <div className="flex gap-2">
            <ActionButton onClick={() => setRunning((x) => !x)}>
              {running ? "Pause" : "Start traffic"}
            </ActionButton>
            <ActionButton variant="ghost" onClick={reset}>
              Reset
            </ActionButton>
          </div>
        </div>

        <div className="grid gap-5 border-t border-[var(--hairline)] pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <Slider
            label="incoming traffic"
            min={1}
            max={12}
            value={rate}
            onChange={setRate}
            display={`${Math.round(offeredRps)} req/s`}
          />
          <div>
            <label className="mono-label flex items-center justify-between text-[var(--slate)]">
              rate limiter
              <button
                role="switch"
                aria-checked={rateLimit}
                onClick={() => setRateLimit((v) => !v)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  rateLimit ? "bg-[var(--coral)]" : "bg-[var(--hairline)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    rateLimit ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              {rateLimit ? "shedding traffic above the cap" : "accept everything"}
            </p>
          </div>
          <div className={rateLimit ? "" : "pointer-events-none opacity-40"}>
            <Slider
              label="accept limit"
              min={1}
              max={12}
              value={limit}
              onChange={setLimit}
              display={`${Math.round(limit * TICKS_PER_SEC)} req/s`}
            />
          </div>
        </div>
      </Panel>

      {/* Visualisation */}
      <Panel tone="ink" className="p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${running ? "bg-[var(--coral)]" : "bg-white/30"}`} />
          <span className="mono-label text-white/45">
            balancer · {strategy} · {totalActive} in flight
          </span>
        </div>

        {/* Incoming traffic → balancer */}
        <div className="mt-6 flex items-center gap-3 sm:gap-4">
          <span className="hidden shrink-0 font-mono text-[10px] uppercase leading-tight text-white/40 sm:block">
            incoming
            <br />
            traffic
          </span>
          <div className="relative h-14 flex-1 overflow-hidden rounded-[10px] bg-white/[0.05]">
            <div className="absolute inset-y-0 left-3 flex items-center font-mono text-[11px] text-white/30">
              {Math.round(offeredRps)} req/s
            </div>
            {Array.from({ length: streamDots }).map((_, d) => {
              const dur = Math.max(0.7, 2.2 - rate * 0.12);
              return (
                <span
                  key={d}
                  className="absolute h-2 w-2 rounded-full bg-[var(--coral)]"
                  style={{
                    top: `${18 + ((d * 37) % 64)}%`,
                    animation: `lab-stream ${dur}s linear infinite`,
                    animationDelay: `${-(d * dur) / streamDots}s`,
                    animationPlayState: running ? "running" : "paused",
                  }}
                />
              );
            })}
          </div>
          <div
            className={`flex shrink-0 flex-col items-center justify-center rounded-[10px] border px-3 py-2.5 transition-colors ${
              overloaded
                ? "border-[var(--coral)] bg-[var(--coral)]/15"
                : "border-white/15 bg-white/[0.05]"
            }`}
          >
            <span className="heading text-[13px] text-white sm:text-[15px]">Balancer</span>
            <span className="font-mono text-[10px] text-white/40">
              {rateLimit ? `limit ${Math.round(limit * TICKS_PER_SEC)}/s` : strategy}
            </span>
          </div>
        </div>

        {/* Utilization meter */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[11px]">
            <span className="text-white/40">
              fleet utilization — {Math.round(acceptedRps)} accepted / {Math.round(capacityRps)} max req/s
            </span>
            <span className={overloaded ? "text-[var(--coral-soft)]" : "text-[#7ef0d8]"}>
              {utilPct}%{overloaded ? " · saturating" : ""}
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="absolute inset-y-0 left-full w-px -translate-x-px bg-white/30" />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                overloaded ? "bg-[var(--coral)]" : "bg-[#50e3c2]"
              }`}
              style={{ width: `${Math.min(100, utilPct)}%` }}
            />
          </div>
          {overloaded && (
            <p className="mt-2 text-[12px] text-[var(--coral-soft)]">
              ⚠ Accepted traffic exceeds what the fleet can drain — queues build
              and servers tip into overload.{" "}
              {!rateLimit && "Turn on the rate limiter to shed the excess."}
            </p>
          )}
        </div>

        <div className="my-6 h-px bg-white/10" />

        {/* Servers — heights scale with weight/capacity */}
        <div
          className="grid items-end gap-4"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0,1fr))` }}
        >
          {servers.map((s, i) => {
            const cap = caps[i];
            const over = s.active > cap;
            const pct = Math.min(100, (s.active / cap) * 100);
            const boxH = 110 + (weights[i] - 1) * 42;
            return (
              <div key={i} className="flex flex-col">
                <div
                  className="relative overflow-hidden rounded-[10px] bg-white/[0.05]"
                  style={{ height: boxH }}
                >
                  <div className="absolute inset-x-0 top-0 border-b border-dashed border-white/15" />
                  <div
                    className={`absolute inset-x-0 bottom-0 transition-all duration-500 ${
                      over ? "bg-[var(--coral)]" : "bg-[#50e3c2]"
                    } ${pulse === i ? "opacity-100" : "opacity-80"}`}
                    style={{ height: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="display text-[26px] text-white">{s.active}</span>
                  </div>
                  {over && (
                    <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[var(--coral)] px-2 py-0.5 font-mono text-[9px] uppercase text-white">
                      overloaded
                    </span>
                  )}
                </div>
                <p className="mt-2 text-center font-mono text-[11px] text-white/50">
                  server {i}
                  {weighted && <span className="text-[var(--coral-soft)]"> · w{weights[i]}</span>}
                </p>
                <p className="text-center font-mono text-[11px] text-white/35">
                  {s.handled} done · cap {cap}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <div>
          <p className="mono-label text-[var(--muted)]">requests served</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">{totalHandled}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">in flight</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">{totalActive}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">load spread (σ)</p>
          <p className="display mt-1 text-[24px] text-[var(--coral)]">{spread.toFixed(1)}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">fleet utilization</p>
          <p className="display mt-1 text-[24px]" style={{ color: overloaded ? "var(--coral)" : "var(--ink)" }}>
            {utilPct}%
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">shed (429)</p>
          <p className="display mt-1 text-[24px]" style={{ color: rejected > 0 ? "var(--coral)" : "var(--ink)" }}>
            {rejected}
          </p>
        </div>
      </Panel>

      <Note>
        <strong>Round-robin</strong> cycles through servers blindly.{" "}
        <strong>Random</strong> is even simpler and close in practice.{" "}
        <strong>Least-connections</strong> steers new work to the quietest
        server — watch the load <em>spread (σ)</em> stay lowest.{" "}
        <strong>Weighted</strong> recognises that servers aren&apos;t equal: the
        taller boxes have higher capacity, so they should receive proportionally
        more traffic (this uses the same smooth weighted round-robin Nginx
        does). And when demand simply exceeds supply, the{" "}
        <strong>rate limiter</strong> protects the fleet by shedding the excess
        with a 429 rather than letting every server fall over.
      </Note>
    </div>
  );
}
