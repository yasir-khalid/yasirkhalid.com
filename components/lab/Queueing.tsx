"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

type Discipline = "fifo" | "lifo" | "priority";
type Item = { id: number; prio: boolean; wait: number };

const TICK_MS = 600;
const MAX_QUEUE = 12; // capacity - beyond this, requests are dropped

export default function Queueing() {
  const [discipline, setDiscipline] = useState<Discipline>("fifo");
  const [arrival, setArrival] = useState(2); // avg arrivals per tick
  const [serviceTicks, setServiceTicks] = useState(2); // ticks to serve one
  const [running, setRunning] = useState(false);

  const [queue, setQueue] = useState<Item[]>([]);
  const [inService, setInService] = useState<{ item: Item; remaining: number } | null>(null);
  const [stats, setStats] = useState({ arrived: 0, served: 0, dropped: 0 });
  const [waits, setWaits] = useState<number[]>([]); // completed wait times (ticks)

  const idRef = useRef(0);
  const ref = useRef({ queue, inService, discipline, arrival, serviceTicks });
  ref.current = { queue, inService, discipline, arrival, serviceTicks };

  function enqueue(prio: boolean) {
    setQueue((q) => {
      if (q.length >= MAX_QUEUE) {
        setStats((s) => ({ ...s, arrived: s.arrived + 1, dropped: s.dropped + 1 }));
        return q;
      }
      setStats((s) => ({ ...s, arrived: s.arrived + 1 }));
      return [...q, { id: idRef.current++, prio, wait: 0 }];
    });
  }

  function pickNext(q: Item[], d: Discipline): [Item, Item[]] {
    if (d === "lifo") return [q[q.length - 1], q.slice(0, -1)];
    if (d === "priority") {
      const idx = q.findIndex((x) => x.prio);
      const i = idx === -1 ? 0 : idx;
      return [q[i], [...q.slice(0, i), ...q.slice(i + 1)]];
    }
    return [q[0], q.slice(1)]; // fifo
  }

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const { discipline, arrival, serviceTicks } = ref.current;

      // 1. progress / complete current job
      setInService((cur) => {
        if (cur && cur.remaining > 1) return { ...cur, remaining: cur.remaining - 1 };
        if (cur) {
          setStats((s) => ({ ...s, served: s.served + 1 }));
          setWaits((w) => [...w.slice(-49), cur.item.wait]);
        }
        return null; // freed (or stays free)
      });

      // 2. age queued items, then pull next into a free server
      setQueue((q) => {
        let next = q.map((x) => ({ ...x, wait: x.wait + 1 }));
        // peek server state on next tick: if currently busy with >1 remaining it stays busy
        const cur = ref.current.inService;
        const serverBusyNext = cur && cur.remaining > 1;
        if (!serverBusyNext && next.length > 0) {
          const [chosen, rest] = pickNext(next, discipline);
          setInService({ item: chosen, remaining: serviceTicks });
          next = rest;
        }
        return next;
      });

      // 3. arrivals (bursty around the rate)
      const count = Math.max(0, Math.round(arrival - 1 + Math.random() * 2));
      for (let a = 0; a < count; a++) {
        enqueue(discipline === "priority" ? Math.random() < 0.25 : false);
      }
    }, TICK_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function reset() {
    setRunning(false);
    setQueue([]);
    setInService(null);
    setStats({ arrived: 0, served: 0, dropped: 0 });
    setWaits([]);
  }

  // Offered load ρ = arrival rate ÷ service rate (1 / serviceTicks).
  const rho = arrival * serviceTicks;
  const overloaded = rho > 1;
  const sorted = [...waits].sort((a, b) => a - b);
  const p = (q: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : 0);
  const p50 = p(0.5);
  const p99 = p(0.99);

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A queue lets a server absorb bursts: requests wait in line instead of
        being dropped. But a queue can&apos;t add capacity. When requests arrive
        faster than the server drains them - <strong>utilisation ρ &gt; 1</strong>{" "}
        - the line grows without bound and waiting time explodes. The{" "}
        <strong>discipline</strong> (who gets served next) decides who pays that
        cost.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <Segmented<Discipline>
          label="queue discipline"
          value={discipline}
          onChange={setDiscipline}
          options={[
            { value: "fifo", label: "FIFO" },
            { value: "lifo", label: "LIFO" },
            { value: "priority", label: "Priority" },
          ]}
        />
        <div className="w-full max-w-[180px]">
          <Slider label="arrival rate" min={0} max={6} value={arrival} onChange={setArrival} display={`${arrival}/tick`} />
        </div>
        <div className="w-full max-w-[180px]">
          <Slider label="service time" min={1} max={4} value={serviceTicks} onChange={setServiceTicks} display={`${serviceTicks} ticks`} />
        </div>
        <div className="flex gap-2">
          <ActionButton onClick={() => setRunning((r) => !r)}>
            {running ? "⏸ Pause" : "▶ Start simulation"}
          </ActionButton>
          <ActionButton variant="ghost" onClick={reset}>Reset</ActionButton>
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => enqueue(false)} className="tag-mono transition-colors hover:border-[var(--ink)]">+ request</button>
        <button onClick={() => enqueue(true)} className="tag-mono transition-colors hover:border-[var(--ink)]">+ priority request</button>
      </div>

      {/* Visualisation */}
      <Panel tone="stone" className="p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[var(--mute)]">
            queue · {queue.length}/{MAX_QUEUE}
          </span>
          <span
            className={`rounded-full px-3 py-1 font-mono text-[11px] ${
              overloaded ? "bg-[#fdeced] text-[var(--accent-danger)]" : "bg-[rgba(0,168,126,0.1)] text-[var(--accent-teal)]"
            }`}
          >
            ρ = {rho.toFixed(2)} {overloaded ? "· overloaded" : "· stable"}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          {/* the line */}
          <div className="flex min-h-[3rem] flex-1 flex-wrap content-start gap-1.5 rounded-[4px] border border-[var(--hairline-light)] bg-white p-3">
            {queue.length === 0 && (
              <span className="font-mono text-[11px] text-[var(--stone-text)]">empty queue</span>
            )}
            {queue.map((it) => (
              <span
                key={it.id}
                className={`lab-pop h-6 w-6 rounded-[6px] ${
                  it.prio ? "bg-[var(--primary)]" : "bg-[var(--charcoal)]"
                }`}
                title={`waited ${it.wait} ticks${it.prio ? " · priority" : ""}`}
              />
            ))}
          </div>

          <span className="font-mono text-[18px] text-[var(--stone-text)]">→</span>

          {/* server */}
          <div
            className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-[12px] border text-center transition-colors ${
              inService ? "border-[var(--accent-teal)] bg-[rgba(0,168,126,0.08)]" : "border-[var(--hairline-light)] bg-white"
            }`}
          >
            <span className="mono-label text-[10px] text-[var(--mute)]">server</span>
            <span className="display mt-1 text-[20px] text-[var(--ink)]">
              {inService ? inService.remaining : "·"}
            </span>
          </div>
        </div>
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-x-10 gap-y-6 p-5">
        <div>
          <p className="mono-label text-[var(--mute)]">served</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">{stats.served}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">in queue</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">{queue.length}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">dropped (full)</p>
          <p className="display mt-1 text-[24px]" style={{ color: stats.dropped ? "var(--accent-danger)" : "var(--ink)" }}>{stats.dropped}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">p50 wait</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">{p50} t</p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">p99 wait</p>
          <p className="display mt-1 text-[24px] text-[var(--accent-danger)]">{p99} t</p>
        </div>
      </Panel>

      <Note>
        Two things to try. First, push <strong>arrival rate</strong> until ρ
        crosses 1 and watch the queue fill to capacity and start{" "}
        <em>dropping</em> - latency was already climbing long before that. Second,
        flip to <strong>LIFO</strong> under load: throughput is identical, but
        the oldest requests starve at the back, wrecking p99 - which is why
        newest-first queues quietly destroy tail latency. <strong>Priority</strong>{" "}
        lets the cobalt requests jump the line so the work that matters stays
        fast while the rest absorbs the delay.
      </Note>
    </div>
  );
}
