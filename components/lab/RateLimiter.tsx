"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

// =====================================================================
// Design a rate limiter (Alex Xu vol.1, ch.4). Four algorithms, one live
// stream of requests, each with its own literal visualization: discrete
// tokens in a bucket being spent and refilled, a draining FIFO queue, and
// time-window timelines. A simulation tick = 0.2s of model time.
// =====================================================================

type Algo = "token" | "leaky" | "fixed" | "sliding";

const ALGOS: { value: Algo; label: string }[] = [
  { value: "token", label: "Token bucket" },
  { value: "leaky", label: "Leaking bucket" },
  { value: "fixed", label: "Fixed window" },
  { value: "sliding", label: "Sliding window" },
];

type AlgoInfo = {
  tag: string;
  tone: "key" | "info" | "warn";
  body: React.ReactNode;
  bestFor: string;
  watchOut: string;
  usedBy: string;
};

const ALGO_INFO: Record<Algo, AlgoInfo> = {
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
    bestFor:
      "Public APIs and gateways that must bound the average rate but still let real clients fire short bursts.",
    watchOut:
      "A client can drain a full bucket instantly - size the burst to what your backend can actually absorb.",
    usedBy: "AWS API Gateway, Stripe, GitHub API, Envoy, NGINX upstream",
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
    bestFor:
      "Traffic shaping - feeding a fragile downstream (payments, legacy DB, a metered 3rd-party API) a perfectly constant rate.",
    watchOut:
      "Queuing adds latency, and under sustained load a stale queue drops fresh requests while old ones wait.",
    usedBy: "NGINX limit_req, Shopify, job / message pipelines",
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
    bestFor:
      "Coarse quotas and billing counters - '10k requests/day', '5 OTPs/hour' - where the exact edge doesn't matter.",
    watchOut:
      "A burst centred on the boundary can pass up to 2× the limit in a short span.",
    usedBy: "In-house quota counters, early-stage APIs",
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
    bestFor:
      "Accurate, fair limiting at high scale - abuse/DDoS protection at the edge - without the fixed-window loophole.",
    watchOut:
      "The exact log variant is memory-heavy (one entry per request); the counter is a tiny approximation.",
    usedBy: "Cloudflare, Kong, Redis cell-rate limiters",
  },
};

const DT = 0.2; // seconds of model time per tick
const TICK_MS = 200;
const STREAM = 48;

const TEAL = "var(--accent-teal)";
const COBALT = "var(--primary)";
const AMBER = "var(--accent-warning)";
const RED = "var(--accent-danger)";

type Sim = {
  tokens: number; // token bucket
  queue: number; // leaky bucket depth
  fixedCount: number;
  fixedStart: number;
  fixedHistory: number[]; // completed-window counts
  slidePrev: number;
  slideCurr: number;
  slideStart: number;
  t: number;
  burst: number;
};

// What the stages render each tick.
type View = {
  tokens: number;
  spentPulse: number; // bumps each time a token is spent, to retrigger the spend animation
  queue: number;
  leakPulse: number;
  overflow: boolean;
  fixedCount: number;
  fixedElapsed: number; // 0..1 into the current 1s window
  fixedHistory: number[];
  slidePrev: number;
  slideCurr: number;
  slideElapsed: number;
};

function freshSim(capacity: number): Sim {
  return {
    tokens: capacity,
    queue: 0,
    fixedCount: 0,
    fixedStart: 0,
    fixedHistory: [],
    slidePrev: 0,
    slideCurr: 0,
    slideStart: 0,
    t: 0,
    burst: 0,
  };
}

const freshView = (capacity: number): View => ({
  tokens: capacity,
  spentPulse: 0,
  queue: 0,
  leakPulse: 0,
  overflow: false,
  fixedCount: 0,
  fixedElapsed: 0,
  fixedHistory: [],
  slidePrev: 0,
  slideCurr: 0,
  slideElapsed: 0,
});

/* ---- small shared bits ---- */
function RateChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-mono text-[11px] text-[var(--charcoal)] ring-1 ring-[var(--hairline-light)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ============================================================ *
 * Token bucket - discrete coins spent and refilled            *
 * ============================================================ */
function TokenStage({ tokens, capacity, refill, spentPulse }: { tokens: number; capacity: number; refill: number; spentPulse: number }) {
  const whole = Math.floor(tokens + 1e-6);
  const frac = tokens - whole;
  const coin = capacity <= 12 ? 22 : capacity <= 20 ? 17 : 13;
  const dripDur = `${Math.max(0.45, 1.6 / Math.max(1, refill)).toFixed(2)}s`;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* faucet dripping tokens in at the refill rate */}
      <div className="relative h-8 w-full">
        <div className="absolute left-1/2 top-0 h-3 w-10 -translate-x-1/2 rounded-b-[6px] bg-[var(--hairline-strong)]" />
        {[0, 0.5].map((d, i) => (
          <span
            key={i}
            className="lab-drip absolute left-1/2 top-3 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
            style={{ background: TEAL, ["--drip-dur" as string]: dripDur, ["--drip-dist" as string]: "20px", animationDelay: `${d * parseFloat(dripDur)}s` }}
          />
        ))}
      </div>

      {/* the bucket */}
      <div className="relative flex h-[190px] w-[150px] flex-col-reverse items-center justify-start gap-1.5 rounded-b-[18px] rounded-t-[6px] border-2 border-t-0 border-[var(--hairline-strong)] bg-white p-3">
        <div className="flex flex-wrap-reverse content-start items-end justify-center gap-1.5">
          {Array.from({ length: capacity }).map((_, i) => {
            const filled = i < whole;
            const partial = i === whole && frac > 0.15;
            return (
              <span
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: coin,
                  height: coin,
                  background: filled ? TEAL : partial ? "rgba(0,168,126,0.35)" : "var(--hairline-light)",
                  transform: filled || partial ? "scale(1)" : "scale(0.62)",
                  boxShadow: filled ? "inset 0 0 0 1.5px rgba(255,255,255,0.55)" : "none",
                }}
              />
            );
          })}
        </div>
        {/* spend flash near the rim */}
        {spentPulse > 0 && (
          <span
            key={spentPulse}
            className="lab-spend pointer-events-none absolute right-3 top-2 rounded-full"
            style={{ width: coin, height: coin, background: TEAL }}
          />
        )}
      </div>

      <p className="font-mono text-[13px] font-semibold text-[var(--ink)]">{tokens.toFixed(1)} / {capacity} tokens</p>
      <div className="flex flex-wrap justify-center gap-2">
        <RateChip color={TEAL} label={`+${refill}/s refill`} />
        <RateChip color={COBALT} label="-1 per request" />
      </div>
    </div>
  );
}

/* ============================================================ *
 * Leaking bucket - a FIFO queue draining at a fixed rate      *
 * ============================================================ */
function LeakyStage({ queue, capacity, outflow, overflow }: { queue: number; capacity: number; outflow: number; overflow: boolean }) {
  const q = Math.round(queue);
  const dripDur = `${Math.max(0.4, 1.4 / Math.max(1, outflow)).toFixed(2)}s`;
  return (
    <div className="flex flex-col items-center gap-3">
      {/* overflow splash when the queue is full */}
      <div className="flex h-8 items-center">
        {overflow ? (
          <span className="rounded-full bg-[rgba(226,59,74,0.12)] px-3 py-1 font-mono text-[11px] font-semibold" style={{ color: RED }}>
            overflow → dropped
          </span>
        ) : (
          <span className="font-mono text-[11px] text-[var(--stone-text)]">arrivals queue here ↓</span>
        )}
      </div>

      {/* the bucket - queued requests stack from the bottom */}
      <div
        className="relative flex h-[190px] w-[150px] flex-col-reverse items-stretch gap-[3px] rounded-b-[18px] rounded-t-[6px] border-2 border-t-0 p-2 transition-colors"
        style={{ borderColor: overflow ? RED : "var(--hairline-strong)", background: "white" }}
      >
        {Array.from({ length: capacity }).map((_, i) => (
          <span
            key={i}
            className="rounded-[3px] transition-all duration-200"
            style={{ flex: 1, background: i < q ? COBALT : "var(--hairline-light)", opacity: i < q ? 0.9 : 1 }}
          />
        ))}
        {/* leak hole */}
        <span className="absolute -bottom-[6px] left-1/2 h-3 w-4 -translate-x-1/2 rounded-b-[4px] bg-[var(--hairline-strong)]" />
      </div>
      {/* leak drips */}
      <div className="relative h-6 w-full">
        {[0, 0.5].map((d, i) => (
          <span
            key={i}
            className="lab-drip absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
            style={{ background: COBALT, ["--drip-dur" as string]: dripDur, ["--drip-dist" as string]: "22px", animationDelay: `${d * parseFloat(dripDur)}s` }}
          />
        ))}
      </div>

      <p className="font-mono text-[13px] font-semibold text-[var(--ink)]">{q} / {capacity} queued</p>
      <div className="flex flex-wrap justify-center gap-2">
        <RateChip color={COBALT} label="+1 per request" />
        <RateChip color={TEAL} label={`-${outflow}/s leak`} />
      </div>
    </div>
  );
}

/* ============================================================ *
 * Fixed window - a timeline of per-second counters            *
 * ============================================================ */
function FixedStage({ count, capacity, elapsed, history }: { count: number; capacity: number; elapsed: number; history: number[] }) {
  const bars = [...history.slice(-5), count];
  const currentIdx = bars.length - 1;
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex h-[210px] w-full items-end justify-center gap-2 px-1">
        {bars.map((c, i) => {
          const isCurrent = i === currentIdx;
          const h = Math.min(1, c / capacity);
          const atLimit = c >= capacity;
          return (
            <div key={i} className="flex h-full w-9 flex-col items-center justify-end gap-1.5">
              <span className="font-mono text-[11px]" style={{ color: atLimit ? RED : "var(--charcoal)" }}>{c}</span>
              <div className="relative flex w-full flex-1 items-end overflow-hidden rounded-[5px] bg-[var(--hairline-light)]">
                {/* limit line */}
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-[var(--accent-danger)]" />
                <div
                  className="w-full rounded-[5px] transition-all duration-200"
                  style={{ height: `${Math.max(2, h * 100)}%`, background: atLimit ? RED : isCurrent ? COBALT : "rgba(73,79,223,0.4)" }}
                />
              </div>
              {/* elapsed progress on the current window */}
              <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--hairline-light)]">
                {isCurrent && <div className="h-full rounded-full transition-all" style={{ width: `${elapsed * 100}%`, background: AMBER }} />}
              </div>
              <span className="font-mono text-[9px] text-[var(--stone-text)]">{isCurrent ? "now" : `-${currentIdx - i}s`}</span>
            </div>
          );
        })}
      </div>
      <p className="font-mono text-[13px] font-semibold text-[var(--ink)]">{count} / {capacity} this window</p>
      <p className="max-w-[28ch] text-center text-[11px] leading-snug text-[var(--stone-text)]">
        the dashed line is the limit · each bar resets to 0 on the 1s boundary
      </p>
    </div>
  );
}

/* ============================================================ *
 * Sliding window - weighted previous + current vs limit       *
 * ============================================================ */
function SlidingStage({ prev, curr, capacity, elapsed }: { prev: number; curr: number; capacity: number; elapsed: number }) {
  const weight = 1 - elapsed;
  const weightedPrev = prev * weight;
  const est = curr + weightedPrev;
  const overLimit = est >= capacity;
  const pct = (v: number) => Math.min(100, (v / capacity) * 100);
  return (
    <div className="flex w-full flex-col items-center gap-4 py-2">
      {/* the rolling estimate vs the limit */}
      <div className="w-full">
        <div className="mb-1.5 flex items-baseline justify-between font-mono text-[11px]">
          <span className="text-[var(--stone-text)]">rolling estimate</span>
          <span style={{ color: overLimit ? RED : "var(--ink)" }}>{est.toFixed(1)} / {capacity}</span>
        </div>
        <div className="relative h-9 w-full overflow-hidden rounded-[8px] bg-[var(--hairline-light)] ring-1 ring-[var(--hairline-light)]">
          {/* weighted previous window */}
          <div className="absolute inset-y-0 left-0 transition-all duration-200" style={{ width: `${pct(weightedPrev)}%`, background: "rgba(73,79,223,0.35)" }} />
          {/* current window stacked after it */}
          <div className="absolute inset-y-0 transition-all duration-200" style={{ left: `${pct(weightedPrev)}%`, width: `${pct(curr)}%`, background: overLimit ? RED : COBALT }} />
          {/* limit edge */}
          <div className="absolute inset-y-0 right-0 w-[2px]" style={{ background: RED }} />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[var(--stone-text)]">
          <span>0</span>
          <span style={{ color: RED }}>limit {capacity}</span>
        </div>
      </div>

      {/* the formula, made concrete */}
      <div className="flex w-full items-stretch gap-2 font-mono text-[11px]">
        <div className="flex-1 rounded-[8px] bg-white p-2.5 text-center ring-1 ring-[var(--hairline-light)]">
          <p className="text-[var(--stone-text)]">prev window</p>
          <p className="mt-1 text-[15px] font-semibold" style={{ color: "rgba(73,79,223,0.7)" }}>{prev}</p>
          <p className="mt-0.5 text-[10px] text-[var(--muted)]">× {weight.toFixed(2)} overlap</p>
        </div>
        <div className="flex items-center text-[16px] text-[var(--muted)]">+</div>
        <div className="flex-1 rounded-[8px] bg-white p-2.5 text-center ring-1 ring-[var(--hairline-light)]">
          <p className="text-[var(--stone-text)]">this window</p>
          <p className="mt-1 text-[15px] font-semibold" style={{ color: COBALT }}>{curr}</p>
          <p className="mt-0.5 text-[10px] text-[var(--muted)]">{Math.round(elapsed * 100)}% elapsed</p>
        </div>
        <div className="flex items-center text-[16px] text-[var(--muted)]">=</div>
        <div className="flex-1 rounded-[8px] p-2.5 text-center ring-1" style={{ background: overLimit ? "rgba(226,59,74,0.06)" : "rgba(0,168,126,0.06)", ["--tw-ring-color" as string]: overLimit ? RED : TEAL }}>
          <p className="text-[var(--stone-text)]">estimate</p>
          <p className="mt-1 text-[15px] font-semibold" style={{ color: overLimit ? RED : TEAL }}>{est.toFixed(1)}</p>
          <p className="mt-0.5 text-[10px] text-[var(--muted)]">{overLimit ? "reject" : "accept"}</p>
        </div>
      </div>
    </div>
  );
}

export default function RateLimiter() {
  const [algo, setAlgo] = useState<Algo>("token");
  const [rate, setRate] = useState(8); // arrival rate, req/s
  const [capacity, setCapacity] = useState(12); // bucket size / window limit
  const [refill, setRefill] = useState(10); // refill (token) / outflow (leaky) per s
  const [running, setRunning] = useState(true);

  const [stream, setStream] = useState<{ id: number; ok: boolean }[]>([]);
  const [totals, setTotals] = useState({ ok: 0, no: 0 });
  const [view, setView] = useState<View>(() => freshView(capacity));

  const sim = useRef<Sim>(freshSim(capacity));
  const idRef = useRef(0);
  const spentRef = useRef(0);
  const leakRef = useRef(0);
  // live params for the interval closure
  const cfg = useRef({ algo, rate, capacity, refill });
  cfg.current = { algo, rate, capacity, refill };

  function reset() {
    sim.current = freshSim(cfg.current.capacity);
    idRef.current = 0;
    setStream([]);
    setTotals({ ok: 0, no: 0 });
    setView(freshView(cfg.current.capacity));
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
      const prevQueue = s.queue;
      const prevTokens = s.tokens;
      s.t += DT;

      // continuous refill / leak / window rolls
      if (algo === "token") s.tokens = Math.min(capacity, s.tokens + refill * DT);
      if (algo === "leaky") s.queue = Math.max(0, s.queue - refill * DT);
      if (algo === "fixed") {
        while (s.t - s.fixedStart >= 1) {
          s.fixedStart += 1;
          s.fixedHistory.push(s.fixedCount);
          if (s.fixedHistory.length > 6) s.fixedHistory.shift();
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
      let overflow = false;
      for (let i = 0; i < arrivals; i++) {
        let accept = false;
        if (algo === "token") {
          if (s.tokens >= 1) { s.tokens -= 1; accept = true; }
        } else if (algo === "leaky") {
          if (s.queue < capacity) { s.queue += 1; accept = true; } else { overflow = true; }
        } else if (algo === "fixed") {
          if (s.fixedCount < capacity) { s.fixedCount += 1; accept = true; }
        } else {
          const elapsed = s.t - s.slideStart; // 0..1 into current window
          const estv = s.slideCurr + s.slidePrev * (1 - elapsed);
          if (estv < capacity) { s.slideCurr += 1; accept = true; }
        }
        events.push({ id: idRef.current++, ok: accept });
        if (accept) ok++;
        else no++;
      }

      if (algo === "token" && s.tokens < prevTokens) spentRef.current++;
      if (algo === "leaky" && s.queue < prevQueue) leakRef.current++;

      if (events.length) {
        setStream((prev) => [...prev, ...events].slice(-STREAM));
        setTotals((prev) => ({ ok: prev.ok + ok, no: prev.no + no }));
      }

      setView({
        tokens: s.tokens,
        spentPulse: spentRef.current,
        queue: s.queue,
        leakPulse: leakRef.current,
        overflow,
        fixedCount: s.fixedCount,
        fixedElapsed: s.t - s.fixedStart,
        fixedHistory: [...s.fixedHistory],
        slidePrev: s.slidePrev,
        slideCurr: s.slideCurr,
        slideElapsed: s.t - s.slideStart,
      });
    }, TICK_MS);
    return () => clearInterval(handle);
  }, [running]);

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
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
          <p className="text-[12px] leading-[1.5] text-[var(--stone-text)]">
            Tip: push the arrival rate above the {algo === "token" ? "refill" : algo === "leaky" ? "outflow" : "limit"} and hit{" "}
            <strong className="text-[var(--charcoal)]">⚡ Burst</strong> to see this algorithm&apos;s failure mode.
          </p>
        </Panel>

        {/* Visualization */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* the algorithm-specific stage */}
          <Panel tone="stone" className="flex items-center justify-center p-6">
            {algo === "token" && <TokenStage tokens={view.tokens} capacity={capacity} refill={refill} spentPulse={view.spentPulse} />}
            {algo === "leaky" && <LeakyStage queue={view.queue} capacity={capacity} outflow={refill} overflow={view.overflow} />}
            {algo === "fixed" && <FixedStage count={view.fixedCount} capacity={capacity} elapsed={view.fixedElapsed} history={view.fixedHistory} />}
            {algo === "sliding" && <SlidingStage prev={view.slidePrev} curr={view.slideCurr} capacity={capacity} elapsed={view.slideElapsed} />}
          </Panel>

          {/* stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-[12px] border border-[var(--hairline-light)] bg-white p-4">
              <p className="mono-label text-[10px] text-[var(--accent-teal)]">accepted</p>
              <p className="display mt-1.5 text-[clamp(1.4rem,2.4vw,2rem)] text-[var(--ink)]">{totals.ok}</p>
            </div>
            <div className="rounded-[12px] border border-[var(--hairline-light)] bg-white p-4">
              <p className="mono-label text-[10px] text-[var(--accent-danger)]">429 rejected</p>
              <p className="display mt-1.5 text-[clamp(1.4rem,2.4vw,2rem)] text-[var(--accent-danger)]">{totals.no}</p>
            </div>
            <div className="col-span-2 rounded-[12px] border border-[var(--hairline-light)] bg-white p-4">
              <div className="flex items-baseline justify-between">
                <p className="mono-label text-[10px] text-[var(--stone-text)]">accept rate</p>
                <p className="font-mono text-[13px] text-[var(--charcoal)]">{acceptPct}%</p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(226,59,74,0.18)]">
                <div className="h-full rounded-full bg-[var(--accent-teal)] transition-all" style={{ width: `${acceptPct}%` }} />
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

      {/* contextual "when to use this one" for the selected algorithm */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[12px] bg-[rgba(0,168,126,0.05)] p-5 ring-1 ring-[rgba(0,168,126,0.22)]">
          <p className="mono-label text-[var(--accent-teal)]">best for</p>
          <p className="mt-2 text-[14px] leading-[1.5] text-[var(--ink)]">{info.bestFor}</p>
        </div>
        <div className="rounded-[12px] bg-[rgba(236,126,0,0.06)] p-5 ring-1 ring-[rgba(236,126,0,0.25)]">
          <p className="mono-label text-[var(--accent-warning)]">watch out</p>
          <p className="mt-2 text-[14px] leading-[1.5] text-[var(--ink)]">{info.watchOut}</p>
        </div>
        <div className="rounded-[12px] bg-[var(--surface-soft)] p-5 ring-1 ring-[var(--hairline-light)]">
          <p className="mono-label text-[var(--primary)]">used by</p>
          <p className="mt-2 font-mono text-[13px] leading-[1.55] text-[var(--charcoal)]">{info.usedBy}</p>
        </div>
      </div>

      <Note>
        Try this: set the arrival rate well above the refill rate and hit{" "}
        <strong>Burst</strong>. Token bucket swallows the burst until its tokens
        run dry; leaking bucket smooths it but starts dropping once the queue is
        full; fixed window lets a double-burst through across the second boundary;
        sliding window keeps the rolling total honest. Same flood, four very
        different shapes of pain.
      </Note>

      {/* ---- choosing one + the industry default ---- */}
      <div className="flex flex-col gap-6 border-t border-[var(--hairline)] pt-10">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[13px] font-semibold text-[var(--primary)]">→</span>
          <h2 className="heading text-[clamp(1.4rem,3vw,1.9rem)] text-[var(--ink)]">
            Which one should you reach for?
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ALGOS.map((a) => {
            const ai = ALGO_INFO[a.value];
            const isDefault = a.value === "token";
            return (
              <button
                key={a.value}
                onClick={() => setAlgo(a.value)}
                className={`flex flex-col rounded-[16px] p-5 text-left ring-1 transition-all ${
                  algo === a.value
                    ? "bg-[var(--surface-soft)] ring-[var(--ink)]"
                    : "bg-white ring-[var(--hairline-light)] hover:ring-[var(--charcoal)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="heading text-[18px] text-[var(--ink)]">{a.label}</p>
                  {isDefault && (
                    <span className="shrink-0 rounded-full bg-[rgba(73,79,223,0.1)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[var(--primary)]">
                      industry default
                    </span>
                  )}
                </div>
                <p className="mt-2 flex-1 text-[14px] leading-[1.5] text-[var(--slate)]">{ai.bestFor}</p>
                <p className="mt-3 font-mono text-[11px] text-[var(--stone-text)]">{ai.usedBy}</p>
              </button>
            );
          })}
        </div>

        <Callout label="// the go-to standard right now" tone="key">
          <strong>Token bucket is the de facto default</strong> for API rate
          limiting today - AWS API Gateway, Stripe, GitHub and most gateways ship
          it because it bounds the <em>average</em> rate while still permitting
          the short bursts real clients produce, in O(1) memory that maps cleanly
          onto a single Redis counter (often a <code>GCRA</code> variant). Reach
          past it only for a specific reason: a <strong>sliding window
          counter</strong> when boundary accuracy and fairness beat burst
          tolerance (the edge-CDN / anti-abuse choice), a <strong>leaking
          bucket</strong> when a fragile downstream needs perfectly smooth input,
          and a <strong>fixed window</strong> only for cheap, coarse quotas where
          the 2× edge doesn&apos;t matter.
        </Callout>
      </div>

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
