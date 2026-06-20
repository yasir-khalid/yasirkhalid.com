"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

// =====================================================================
// Design a rate limiter (Alex Xu vol.1, ch.4). Four algorithms, one live
// stream of requests. A simulation tick = 0.2s of model time.
// =====================================================================

type Algo = "token" | "leaky" | "fixed" | "sliding";

const ALGOS: { value: Algo; label: string }[] = [
  { value: "token", label: "Token bucket" },
  { value: "leaky", label: "Leaking bucket" },
  { value: "fixed", label: "Fixed window" },
  { value: "sliding", label: "Sliding window" },
];

const ALGO_INFO: Record<Algo, { tag: string; tone: "key" | "info" | "warn"; body: React.ReactNode }> = {
  token: {
    tag: "token bucket",
    tone: "key",
    body: (
      <>
        A bucket holds up to <strong>capacity</strong> tokens and refills at a
        steady rate. Each request spends one token; no token, no entry. Because a
        full bucket can be spent at once, it <strong>allows short bursts</strong>{" "}
        - which is exactly why Amazon and Stripe use it. Used by most API
        gateways.
      </>
    ),
  },
  leaky: {
    tag: "leaking bucket",
    tone: "info",
    body: (
      <>
        Requests join a FIFO queue and drain at a <strong>fixed outflow
        rate</strong>, so traffic leaves perfectly smooth. The catch: a burst
        fills the queue with old requests, and fresh ones get dropped while they
        wait. Shopify rate-limits this way.
      </>
    ),
  },
  fixed: {
    tag: "fixed window counter",
    tone: "warn",
    body: (
      <>
        Count requests per fixed one-second window; reset on the boundary.
        Dead simple and memory-cheap - but a burst straddling a boundary can
        slip through <strong>up to 2× the limit</strong>. Watch the counter snap
        back to zero each window.
      </>
    ),
  },
  sliding: {
    tag: "sliding window counter",
    tone: "key",
    body: (
      <>
        A hybrid: weight the previous window by how much of it still overlaps the
        rolling window, and add the current count. It <strong>smooths out the
        edge burst</strong> of the fixed window while staying memory-cheap.
        Cloudflare found it mis-classifies only ~0.003% of requests.
      </>
    ),
  },
};

const DT = 0.2; // seconds of model time per tick
const TICK_MS = 200;
const STREAM = 44;

type Sim = {
  tokens: number; // token bucket
  queue: number; // leaky bucket depth
  fixedCount: number;
  fixedStart: number;
  slidePrev: number;
  slideCurr: number;
  slideStart: number;
  t: number;
  burst: number;
};

function freshSim(capacity: number): Sim {
  return {
    tokens: capacity,
    queue: 0,
    fixedCount: 0,
    fixedStart: 0,
    slidePrev: 0,
    slideCurr: 0,
    slideStart: 0,
    t: 0,
    burst: 0,
  };
}

export default function RateLimiter() {
  const [algo, setAlgo] = useState<Algo>("token");
  const [rate, setRate] = useState(12); // arrival rate, req/s
  const [capacity, setCapacity] = useState(10); // bucket size / window limit
  const [refill, setRefill] = useState(5); // refill (token) / outflow (leaky) per s
  const [running, setRunning] = useState(true);

  const [stream, setStream] = useState<{ id: number; ok: boolean }[]>([]);
  const [totals, setTotals] = useState({ ok: 0, no: 0 });
  const [level, setLevel] = useState(0); // 0..1 vessel fill for display
  const [levelText, setLevelText] = useState("");

  const sim = useRef<Sim>(freshSim(capacity));
  const idRef = useRef(0);
  // live params for the interval closure
  const cfg = useRef({ algo, rate, capacity, refill });
  cfg.current = { algo, rate, capacity, refill };

  function reset() {
    sim.current = freshSim(cfg.current.capacity);
    idRef.current = 0;
    setStream([]);
    setTotals({ ok: 0, no: 0 });
  }

  // reset counters when the algorithm changes (params can change live)
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algo]);

  useEffect(() => {
    if (!running) return;
    const handle = setInterval(() => {
      const { algo, rate, capacity, refill } = cfg.current;
      const s = sim.current;
      s.t += DT;

      // continuous refill / leak / window rolls
      if (algo === "token") s.tokens = Math.min(capacity, s.tokens + refill * DT);
      if (algo === "leaky") s.queue = Math.max(0, s.queue - refill * DT);
      if (algo === "fixed") {
        while (s.t - s.fixedStart >= 1) {
          s.fixedStart += 1;
          s.fixedCount = 0;
        }
      }
      if (algo === "sliding") {
        while (s.t - s.slideStart >= 1) {
          s.slideStart += 1;
          s.slidePrev = s.slideCurr;
          s.slideCurr = 0;
        }
      }

      // arrivals this tick (integer part + probabilistic remainder + any burst)
      const lambda = rate * DT;
      let arrivals = Math.floor(lambda);
      if (Math.random() < lambda - arrivals) arrivals++;
      arrivals += s.burst;
      s.burst = 0;

      const events: { id: number; ok: boolean }[] = [];
      let ok = 0;
      let no = 0;
      for (let i = 0; i < arrivals; i++) {
        let accept = false;
        if (algo === "token") {
          if (s.tokens >= 1) { s.tokens -= 1; accept = true; }
        } else if (algo === "leaky") {
          if (s.queue < capacity) { s.queue += 1; accept = true; }
        } else if (algo === "fixed") {
          if (s.fixedCount < capacity) { s.fixedCount += 1; accept = true; }
        } else {
          const elapsed = s.t - s.slideStart; // 0..1 into current window
          const est = s.slideCurr + s.slidePrev * (1 - elapsed);
          if (est < capacity) { s.slideCurr += 1; accept = true; }
        }
        events.push({ id: idRef.current++, ok: accept });
        if (accept) ok++;
        else no++;
      }

      if (events.length) {
        setStream((prev) => [...prev, ...events].slice(-STREAM));
        setTotals((prev) => ({ ok: prev.ok + ok, no: prev.no + no }));
      }

      // vessel readout
      if (algo === "token") {
        setLevel(s.tokens / capacity);
        setLevelText(`${s.tokens.toFixed(1)} / ${capacity} tokens`);
      } else if (algo === "leaky") {
        setLevel(s.queue / capacity);
        setLevelText(`${Math.round(s.queue)} / ${capacity} queued`);
      } else if (algo === "fixed") {
        setLevel(s.fixedCount / capacity);
        setLevelText(`${s.fixedCount} / ${capacity} this window`);
      } else {
        const elapsed = s.t - s.slideStart;
        const est = s.slideCurr + s.slidePrev * (1 - elapsed);
        setLevel(Math.min(1, est / capacity));
        setLevelText(`${est.toFixed(1)} / ${capacity} rolling`);
      }
    }, TICK_MS);
    return () => clearInterval(handle);
  }, [running]);

  // stress = how close we are to rejecting (1 = full / at limit)
  const stress = algo === "token" ? 1 - level : level;
  const vesselColor =
    stress > 0.85 ? "var(--accent-danger)" : stress > 0.6 ? "var(--accent-warning)" : "var(--accent-teal)";

  const total = totals.ok + totals.no;
  const acceptPct = total ? Math.round((totals.ok / total) * 100) : 0;
  const info = ALGO_INFO[algo];
  const isWindow = algo === "fixed" || algo === "sliding";

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A rate limiter decides, request by request, who gets through and who gets
        a <strong>429 Too Many Requests</strong>. The algorithm you pick changes
        how it behaves under a burst. Open the tap, then switch algorithms and
        watch the same flood land differently.
      </Note>

      <Segmented
        label="algorithm"
        value={algo}
        onChange={(v) => setAlgo(v as Algo)}
        options={ALGOS}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* Controls */}
        <Panel className="flex flex-col gap-6 self-start p-6">
          <div className="flex items-center gap-2">
            <ActionButton onClick={() => setRunning((r) => !r)}>
              {running ? "❚❚ Pause" : "▶ Play"}
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => (sim.current.burst += capacity * 2)}>
              ⚡ Burst
            </ActionButton>
            <ActionButton variant="ghost" onClick={reset}>
              Reset
            </ActionButton>
          </div>
          <Slider label="arrival rate (req/s)" min={1} max={40} value={rate} onChange={setRate} display={`${rate}/s`} />
          <Slider
            label={isWindow ? "limit / window" : "bucket capacity"}
            min={2}
            max={30}
            value={capacity}
            onChange={setCapacity}
          />
          {!isWindow && (
            <Slider
              label={algo === "token" ? "refill rate (tokens/s)" : "outflow rate (req/s)"}
              min={1}
              max={20}
              value={refill}
              onChange={setRefill}
              display={`${refill}/s`}
            />
          )}
        </Panel>

        {/* Visualization */}
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)]">
            {/* vessel */}
            <Panel tone="stone" className="flex flex-col items-center gap-3 p-5">
              <p className="mono-label text-[var(--mute)]">{isWindow ? "window" : algo === "token" ? "tokens" : "queue"}</p>
              <div className="relative h-44 w-20 overflow-hidden rounded-[12px] border border-[var(--hairline-light)] bg-white">
                {/* limit line for token bucket sits at top; fill from bottom */}
                <div
                  className="absolute inset-x-0 bottom-0 transition-all duration-200"
                  style={{ height: `${Math.max(2, Math.min(100, level * 100))}%`, background: vesselColor, opacity: 0.85 }}
                />
              </div>
              <p className="text-center font-mono text-[11px] leading-tight text-[var(--charcoal)]">{levelText}</p>
            </Panel>

            {/* stat cards */}
            <div className="grid grid-cols-2 gap-3 self-start">
              <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
                <p className="mono-label text-[10px] text-[var(--accent-teal)]">accepted</p>
                <p className="display mt-1.5 text-[clamp(1.4rem,2.4vw,2rem)] text-[var(--ink)]">{totals.ok}</p>
              </div>
              <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
                <p className="mono-label text-[10px] text-[var(--accent-danger)]">429 rejected</p>
                <p className="display mt-1.5 text-[clamp(1.4rem,2.4vw,2rem)] text-[var(--accent-danger)]">{totals.no}</p>
              </div>
              <div className="col-span-2 rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
                <div className="flex items-baseline justify-between">
                  <p className="mono-label text-[10px] text-[var(--stone-text)]">accept rate</p>
                  <p className="font-mono text-[13px] text-[var(--charcoal)]">{acceptPct}%</p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(226,59,74,0.18)]">
                  <div className="h-full rounded-full bg-[var(--accent-teal)] transition-all" style={{ width: `${acceptPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* request stream */}
          <Panel tone="stone" className="p-5">
            <div className="flex items-center justify-between">
              <p className="mono-label text-[var(--mute)]">request stream</p>
              <span className="flex gap-3 font-mono text-[10px] text-[var(--stone-text)]">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--accent-teal)]" /> 200</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--accent-danger)]" /> 429</span>
              </span>
            </div>
            <div className="mt-3 flex h-7 min-w-0 items-center justify-end gap-1 overflow-hidden">
              {stream.length === 0 && (
                <span className="mr-auto font-mono text-[11px] text-[var(--stone-text)]">waiting for traffic…</span>
              )}
              {stream.map((e) => (
                <span
                  key={e.id}
                  className="h-3.5 w-3.5 shrink-0 rounded-[3px]"
                  style={{ background: e.ok ? "var(--accent-teal)" : "var(--accent-danger)" }}
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Callout label={`// ${info.tag}`} tone={info.tone}>
        {info.body}
      </Callout>

      <Note>
        Try this: set the arrival rate well above the refill rate and hit{" "}
        <strong>Burst</strong>. Token bucket swallows the burst until its tokens
        run dry; leaking bucket smooths it but starts dropping once the queue is
        full; fixed window lets a double-burst through across the second boundary;
        sliding window keeps the rolling total honest. Same flood, four very
        different shapes of pain.
      </Note>

      <Callout label="// the rest of the design" tone="info">
        The algorithm is the easy part. A production limiter stores counters in{" "}
        <strong>Redis</strong> (INCR + EXPIRE) rather than a database, returns{" "}
        <code>X-RateLimit-Remaining</code> / <code>Retry-After</code> headers, and
        - across many limiter instances - has to fight <strong>race
        conditions</strong> (atomic Lua scripts or sorted sets) and clock
        synchronisation.
      </Callout>
    </div>
  );
}
