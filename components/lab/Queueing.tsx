"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Note, Panel, Slider } from "@/components/lab/ui";

const TICK_MS = 600;
const TICK_S = TICK_MS / 1000;

type Sim = {
  queue: number[]; // enqueue tick of each waiting job
  busy: number[]; // remaining ticks per worker (0 = idle)
  tick: number;
  drops: number;
  done: number;
  waitSum: number; // total wait in ticks
  waitN: number;
};

type View = {
  qlen: number;
  busy: number[];
  drops: number;
  done: number;
  avgWaitMs: number;
};

export default function Queueing() {
  const [lambda, setLambda] = useState(6); // arrivals / sec
  const [serviceMs, setServiceMs] = useState(600); // avg service time
  const [workers, setWorkers] = useState(2);
  const [capacity, setCapacity] = useState(12);
  const [running, setRunning] = useState(false);
  const [view, setView] = useState<View>({ qlen: 0, busy: [0, 0], drops: 0, done: 0, avgWaitMs: 0 });

  const sim = useRef<Sim>({ queue: [], busy: [0, 0], tick: 0, drops: 0, done: 0, waitSum: 0, waitN: 0 });
  const p = useRef({ lambda, serviceMs, workers, capacity });
  p.current = { lambda, serviceMs, workers, capacity };

  // keep worker array sized to the control
  useEffect(() => {
    sim.current.busy = Array.from({ length: workers }, (_, i) => sim.current.busy[i] ?? 0);
    setView((v) => ({ ...v, busy: [...sim.current.busy] }));
  }, [workers]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const s = sim.current;
      const { lambda, serviceMs, capacity } = p.current;
      const serviceTicks = Math.max(1, Math.round(serviceMs / TICK_MS));
      s.tick += 1;

      // 1. service: advance busy workers, free the finished ones
      s.busy = s.busy.map((rem) => {
        if (rem > 1) return rem - 1;
        if (rem === 1) {
          s.done += 1;
          return 0;
        }
        return 0;
      });

      // 2. arrivals (Poisson-ish: mean = lambda * tick seconds)
      const mean = lambda * TICK_S;
      const base = Math.floor(mean);
      const arrivals = base + (Math.random() < mean - base ? 1 : 0) + (Math.random() < 0.2 ? 1 : 0);
      for (let a = 0; a < arrivals; a++) {
        if (s.queue.length < capacity) s.queue.push(s.tick);
        else s.drops += 1;
      }

      // 3. assign queued jobs to idle workers
      for (let i = 0; i < s.busy.length; i++) {
        if (s.busy[i] === 0 && s.queue.length > 0) {
          const enq = s.queue.shift()!;
          s.waitSum += s.tick - enq;
          s.waitN += 1;
          // exponential-ish service: vary around the mean
          s.busy[i] = Math.max(1, serviceTicks + (Math.random() < 0.4 ? Math.round(Math.random() * serviceTicks) : 0));
        }
      }

      setView({
        qlen: s.queue.length,
        busy: [...s.busy],
        drops: s.drops,
        done: s.done,
        avgWaitMs: s.waitN ? (s.waitSum / s.waitN) * TICK_MS : 0,
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [running]);

  function reset() {
    setRunning(false);
    sim.current = {
      queue: [],
      busy: Array(workers).fill(0),
      tick: 0,
      drops: 0,
      done: 0,
      waitSum: 0,
      waitN: 0,
    };
    setView({ qlen: 0, busy: Array(workers).fill(0), drops: 0, done: 0, avgWaitMs: 0 });
  }

  // theory
  const mu = 1000 / serviceMs; // service rate per worker (req/s)
  const rho = lambda / (workers * mu); // utilization
  const rhoPct = Math.round(rho * 100);
  const saturated = rho >= 1;
  const streamDots = Math.max(1, Math.min(12, Math.round(lambda * 1.1)));

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A queue absorbs the mismatch between how fast work <em>arrives</em>{" "}
        (rate <strong>λ</strong>) and how fast it can be <em>served</em> (rate{" "}
        <strong>μ</strong>, across <strong>c</strong> workers). As long as
        arrivals stay below capacity the queue stays short. But as utilization{" "}
        <strong>ρ = λ / (c·μ)</strong> approaches 1, waiting time doesn&apos;t
        rise gently — it explodes. Push λ up and watch.
      </Note>

      {/* Controls */}
      <Panel className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label="arrival rate λ" min={1} max={16} value={lambda} onChange={setLambda} display={`${lambda}/s`} />
        <Slider label="service time" min={200} max={1600} step={100} value={serviceMs} onChange={setServiceMs} display={`${serviceMs} ms`} />
        <Slider label="workers (c)" min={1} max={4} value={workers} onChange={setWorkers} />
        <Slider label="queue capacity" min={4} max={30} value={capacity} onChange={setCapacity} />
      </Panel>

      <div className="flex gap-2">
        <ActionButton onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={reset}>
          Reset
        </ActionButton>
      </div>

      {/* Visualisation */}
      <Panel tone="ink" className="p-6 sm:p-8">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          {/* arrivals */}
          <div className="relative h-14 flex-1 overflow-hidden rounded-[10px] bg-white/[0.05]">
            <div className="absolute inset-y-0 left-3 flex items-center font-mono text-[11px] text-white/30">
              λ = {lambda}/s
            </div>
            {Array.from({ length: streamDots }).map((_, d) => {
              const dur = Math.max(0.7, 2.4 - lambda * 0.12);
              return (
                <span
                  key={d}
                  className="absolute h-2 w-2 rounded-full bg-[var(--coral)]"
                  style={{
                    top: `${18 + ((d * 41) % 64)}%`,
                    animation: `lab-stream ${dur}s linear infinite`,
                    animationDelay: `${-(d * dur) / streamDots}s`,
                    animationPlayState: running ? "running" : "paused",
                  }}
                />
              );
            })}
          </div>

          {/* queue */}
          <div className="shrink-0">
            <p className="mb-1.5 text-center font-mono text-[10px] uppercase text-white/40">
              queue · {view.qlen}/{capacity}
            </p>
            <div className="flex flex-wrap gap-1" style={{ maxWidth: 220 }}>
              {Array.from({ length: capacity }).map((_, i) => {
                const filled = i < view.qlen;
                const nearFull = view.qlen >= capacity;
                return (
                  <span
                    key={i}
                    className={`h-4 w-4 rounded-[3px] transition-colors ${
                      filled
                        ? nearFull
                          ? "bg-[var(--coral)]"
                          : "bg-[#50e3c2]"
                        : "bg-white/[0.07]"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* workers */}
          <div className="shrink-0">
            <p className="mb-1.5 text-center font-mono text-[10px] uppercase text-white/40">
              workers · c = {workers}
            </p>
            <div className="flex gap-2">
              {view.busy.map((rem, i) => (
                <div
                  key={i}
                  className={`flex h-12 w-12 items-center justify-center rounded-[10px] border transition-colors ${
                    rem > 0
                      ? "border-[var(--coral)] bg-[var(--coral)]/20 text-[var(--coral-soft)]"
                      : "border-white/15 bg-white/[0.05] text-white/30"
                  }`}
                >
                  <span className="font-mono text-[11px]">{rem > 0 ? "busy" : "idle"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* utilization */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[11px]">
            <span className="text-white/40">utilization ρ = λ / (c·μ)</span>
            <span className={saturated ? "text-[var(--coral-soft)]" : "text-[#7ef0d8]"}>
              {rhoPct}%{saturated ? " · unstable" : ""}
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${saturated ? "bg-[var(--coral)]" : "bg-[#50e3c2]"}`}
              style={{ width: `${Math.min(100, rhoPct)}%` }}
            />
          </div>
          {saturated && (
            <p className="mt-2 text-[12px] text-[var(--coral-soft)]">
              ⚠ ρ ≥ 100% — arrivals outrun the workers. The queue fills, latency
              runs away, and a bounded queue starts dropping work.
            </p>
          )}
        </div>
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <Metric label="in queue" value={`${view.qlen}`} />
        <Metric label="completed" value={`${view.done}`} />
        <Metric label="avg wait" value={`${Math.round(view.avgWaitMs)} ms`} accent={view.avgWaitMs > serviceMs * 3} />
        <Metric label="dropped" value={`${view.drops}`} accent={view.drops > 0} />
        <Metric label="utilization ρ" value={`${rhoPct}%`} accent={saturated} />
      </Panel>

      <Note>
        This is the cruel arithmetic behind tail latency. At ρ = 50% the queue
        is calm; at ρ = 90% the average wait is already several times the
        service time; past 100% it&apos;s unbounded. The fixes are exactly the
        levers above: serve faster (lower <strong>service time</strong>), add{" "}
        <strong>workers</strong>, or cap the <strong>queue</strong> so you fail
        fast instead of melting down. It&apos;s the same reason a checkout line
        with one cashier and a busy store feels infinite.
      </Note>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="mono-label text-[var(--muted)]">{label}</p>
      <p className="display mt-1 text-[24px]" style={{ color: accent ? "var(--coral)" : "var(--ink)" }}>
        {value}
      </p>
    </div>
  );
}
