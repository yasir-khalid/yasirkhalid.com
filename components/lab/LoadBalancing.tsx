"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

type Strategy = "round-robin" | "random" | "least-conn";

type ServerState = { active: number; handled: number };
type InFlight = { id: number; server: number; remaining: number };

const CAPACITY = 6; // visual "full" line per server
const TICK_MS = 650;
const AVG_DURATION = 3.5; // avg ticks a request stays in flight (remaining 2..5)

export default function LoadBalancing() {
  const [count, setCount] = useState(4);
  const [strategy, setStrategy] = useState<Strategy>("round-robin");
  const [traffic, setTraffic] = useState(2); // requests arriving per tick
  const [running, setRunning] = useState(false);
  const [servers, setServers] = useState<ServerState[]>(() =>
    Array.from({ length: 4 }, () => ({ active: 0, handled: 0 }))
  );
  const [flight, setFlight] = useState<InFlight[]>([]);
  const [pulse, setPulse] = useState<number | null>(null);
  const [arrivals, setArrivals] = useState(0); // arrivals in the last tick
  const [tick, setTick] = useState(0); // re-keys the inflow animation each tick

  const rrRef = useRef(0);
  const idRef = useRef(0);
  const trafficRef = useRef(traffic);
  trafficRef.current = traffic;
  const stateRef = useRef({ servers, flight });
  stateRef.current = { servers, flight };

  // Resize server array when the count changes.
  useEffect(() => {
    setServers((prev) => {
      const next = Array.from({ length: count }, (_, i) => prev[i] ?? { active: 0, handled: 0 });
      return next;
    });
    setFlight((prev) => prev.filter((f) => f.server < count));
    rrRef.current = rrRef.current % count;
  }, [count]);

  function pick(servers: ServerState[]): number {
    if (strategy === "random") return Math.floor(Math.random() * servers.length);
    if (strategy === "least-conn") {
      let best = 0;
      servers.forEach((s, i) => {
        if (s.active < servers[best].active) best = i;
      });
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

      // 1. drain finished requests
      const drained: InFlight[] = [];
      const completedPerServer = new Array(servers.length).fill(0);
      flight.forEach((f) => {
        if (f.remaining <= 1) completedPerServer[f.server] += 1;
        else drained.push({ ...f, remaining: f.remaining - 1 });
      });

      // 2. spawn new requests at the user-controlled rate (bursty around it)
      const rate = trafficRef.current;
      const arrivalCount = Math.max(0, Math.round(rate - 1 + Math.random() * 2));
      const newReqs: InFlight[] = [];
      let lastServer = -1;
      for (let a = 0; a < arrivalCount; a++) {
        const target = pick(servers);
        lastServer = target;
        newReqs.push({
          id: idRef.current++,
          server: target,
          remaining: 2 + Math.floor(Math.random() * 4),
        });
      }

      // 3. recompute server state
      const nextServers = servers.map((s, i) => {
        const added = newReqs.filter((r) => r.server === i).length;
        return {
          active: s.active - completedPerServer[i] + added,
          handled: s.handled + completedPerServer[i],
        };
      });

      setServers(nextServers);
      setFlight([...drained, ...newReqs]);
      setArrivals(arrivalCount);
      setTick((t) => t + 1);
      if (lastServer >= 0) {
        setPulse(lastServer);
        setTimeout(() => setPulse(null), 250);
      }
    }, TICK_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, strategy]);

  function reset() {
    setRunning(false);
    setServers(Array.from({ length: count }, () => ({ active: 0, handled: 0 })));
    setFlight([]);
    setArrivals(0);
    rrRef.current = 0;
  }

  const totalHandled = servers.reduce((a, s) => a + s.handled, 0);
  const totalActive = servers.reduce((a, s) => a + s.active, 0);
  // Fairness: spread of handled counts (lower = fairer).
  const mean = totalHandled / servers.length || 0;
  const variance =
    servers.reduce((a, s) => a + (s.handled - mean) ** 2, 0) / servers.length;
  const spread = Math.sqrt(variance);

  // Sustainable throughput (Little's law): a server holds ~CAPACITY concurrent
  // requests, each lasting AVG_DURATION ticks → capacityPerTick arrivals.
  const capacityPerTick = (count * CAPACITY) / AVG_DURATION;
  const utilization = traffic / capacityPerTick; // > 1 means it can't keep up
  const saturating = utilization > 1;

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A load balancer sits in front of a fleet of servers and decides where
        each incoming request goes. The goal: spread work so no single server
        drowns while others sit idle. The <strong>strategy</strong> it uses to
        choose makes a big difference once requests take varying amounts of
        time. Start the stream and watch.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <Segmented<Strategy>
          label="balancing strategy"
          value={strategy}
          onChange={setStrategy}
          options={[
            { value: "round-robin", label: "Round-robin" },
            { value: "random", label: "Random" },
            { value: "least-conn", label: "Least connections" },
          ]}
        />
        <div className="w-full max-w-[200px]">
          <Slider
            label="incoming traffic"
            min={0}
            max={12}
            value={traffic}
            onChange={setTraffic}
            display={`${traffic} req/tick`}
          />
        </div>
        <div className="w-full max-w-[160px]">
          <Slider label="servers" min={2} max={6} value={count} onChange={setCount} />
        </div>
        <div className="flex gap-2">
          <ActionButton onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Start traffic"}
          </ActionButton>
          <ActionButton variant="ghost" onClick={reset}>
            Reset
          </ActionButton>
        </div>
      </Panel>

      {/* Visualisation */}
      <Panel tone="stone" className="p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${running ? "bg-[var(--primary)]" : "bg-[var(--faint)]"}`}
          />
          <span className="mono-label text-[var(--mute)]">
            balancer · {strategy} · {totalActive} in flight
          </span>
        </div>

        {/* Incoming traffic — the controllable inflow lane */}
        <div className="mt-5 rounded-[12px] border border-[var(--hairline-light)] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="mono-label text-[var(--mute)]">incoming traffic</span>
            <span className="font-mono text-[12px] text-[var(--charcoal)]">
              {arrivals} req this tick · {traffic} req/tick set
            </span>
          </div>

          {/* flowing request stream → toward the servers below */}
          <div className="relative mt-3 h-7 overflow-hidden rounded-[6px] border border-[var(--hairline-light)] bg-[var(--surface-soft)]">
            {Array.from({ length: Math.min(arrivals, 14) }).map((_, k) => (
              <span
                key={`${tick}-${k}`}
                className="lab-inflow absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
                style={{
                  background: saturating ? "var(--accent-danger)" : "var(--accent-teal)",
                  animationDelay: `${k * 45}ms`,
                }}
              />
            ))}
            {arrivals === 0 && (
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-[var(--stone-text)]">
                {running ? "no requests this tick" : "press start"}
              </span>
            )}
          </div>

          {/* utilization: arrival rate vs sustainable capacity */}
          <div className="mt-3">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[var(--mute)]">load vs capacity</span>
              <span className={saturating ? "font-medium text-[var(--accent-danger)]" : "text-[var(--ink)]"}>
                {Math.round(utilization * 100)}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--hairline-light)]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  saturating ? "bg-[var(--accent-danger)]" : "bg-[var(--accent-teal)]"
                }`}
                style={{ width: `${Math.min(100, utilization * 100)}%` }}
              />
            </div>
            {saturating && (
              <p className="mt-2 font-mono text-[11px] text-[var(--accent-danger)]">
                ⚠ inflow exceeds what {count} server{count > 1 ? "s" : ""} can
                sustain — queues build and servers tip into overload.
              </p>
            )}
          </div>
        </div>

        <div
          className="mt-6 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0,1fr))` }}
        >
          {servers.map((s, i) => {
            const over = s.active > CAPACITY;
            const pct = Math.min(100, (s.active / CAPACITY) * 100);
            return (
              <div key={i} className="flex flex-col">
                <div className="relative h-44 overflow-hidden rounded-[10px] border border-[var(--hairline-light)] bg-white">
                  {/* capacity line */}
                  <div className="absolute inset-x-0 top-0 border-b border-dashed border-[var(--hairline-light)]" />
                  <div
                    className={`absolute inset-x-0 bottom-0 transition-all duration-500 ${
                      over ? "bg-[var(--accent-danger)]" : "bg-[var(--accent-teal)]"
                    } ${pulse === i ? "opacity-100" : "opacity-85"}`}
                    style={{ height: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="display text-[28px] text-[var(--ink)]">
                      {s.active}
                    </span>
                  </div>
                  {over && (
                    <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[var(--accent-danger)] px-2 py-0.5 font-mono text-[9px] uppercase text-white">
                      overloaded
                    </span>
                  )}
                </div>
                <p className="mt-2 text-center font-mono text-[11px] text-[var(--charcoal)]">
                  server {i}
                </p>
                <p className="text-center font-mono text-[11px] text-[var(--stone-text)]">
                  {s.handled} done
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
          <p className="display mt-1 text-[24px] text-[var(--ink)]">
            {totalHandled}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">in flight</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">
            {totalActive}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">load spread (σ)</p>
          <p className="display mt-1 text-[24px] text-[var(--coral)]">
            {spread.toFixed(1)}
          </p>
        </div>
      </Panel>

      <Note>
        Push the <strong>incoming traffic</strong> slider up and watch the
        load-vs-capacity bar climb. Below 100% the fleet keeps up; cross it and
        requests arrive faster than servers can drain them, so the bars fill
        and tip into <em>overload</em>. You have two levers to fix it: send less
        traffic, or add servers — that&apos;s autoscaling in one picture.
      </Note>

      <Note>
        <strong>Round-robin</strong> hands out requests in a fixed cycle —
        simple, but it ignores how busy each server already is, so a slow
        request can pile up behind it. <strong>Random</strong> is even simpler
        and surprisingly close in practice. <strong>Least-connections</strong>{" "}
        actively steers new work to the quietest server — watch the load{" "}
        <em>spread (σ)</em> stay lowest here, especially with bursty traffic.
      </Note>
    </div>
  );
}
