"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

type Strategy = "none" | "immediate" | "backoff" | "jitter";

const TICK_MS = 350;
const WINDOW = 48;
const JOB_CAP = 900; // safety cap so a retry storm can't hang the tab

type Job = { attempt: number; due: number };
type Sim = {
  jobs: Job[];
  tick: number;
  requests: number;
  attempts: number;
  success: number;
  failed: number;
  peak: number;
  history: number[];
};

const STRATEGY_NOTE: Record<Strategy, string> = {
  none: "No retries. A single failure means the request fails. Lowest load, worst success rate.",
  immediate:
    "Retry instantly on failure. During an outage every client retries at once — a synchronised thundering herd that piles load onto the struggling service.",
  backoff:
    "Wait longer after each failure (1, 2, 4, 8…). This spreads retries out over time, but clients that failed together still retry together.",
  jitter:
    "Exponential backoff plus randomness. Retries are spread out AND de-synchronised, so the load stays smooth even when everything failed at the same instant.",
};

function retryDelay(strategy: Strategy, attempt: number): number {
  const cap = Math.min(2 ** attempt, 16);
  if (strategy === "immediate") return 1;
  if (strategy === "backoff") return cap;
  if (strategy === "jitter") return 1 + Math.floor(Math.random() * cap);
  return 0;
}

export default function Retries() {
  const [strategy, setStrategy] = useState<Strategy>("immediate");
  const [failRate, setFailRate] = useState(60); // % a single attempt fails
  const [maxRetries, setMaxRetries] = useState(4);
  const [clientRate, setClientRate] = useState(4); // new requests / tick
  const [feedback, setFeedback] = useState(true); // load worsens failure rate
  const [running, setRunning] = useState(false);
  const [view, setView] = useState({ load: 0, peak: 0, inflight: 0, requests: 0, attempts: 0, success: 0, failed: 0, history: [] as number[] });

  const sim = useRef<Sim>({ jobs: [], tick: 0, requests: 0, attempts: 0, success: 0, failed: 0, peak: 0, history: [] });
  const p = useRef({ strategy, failRate, maxRetries, clientRate, feedback });
  p.current = { strategy, failRate, maxRetries, clientRate, feedback };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const s = sim.current;
      const { strategy, failRate, maxRetries, clientRate, feedback } = p.current;
      s.tick += 1;

      // spawn new requests
      for (let i = 0; i < clientRate; i++) {
        if (s.jobs.length < JOB_CAP) {
          s.jobs.push({ attempt: 0, due: s.tick });
          s.requests += 1;
        }
      }

      // attempts due this tick
      const due = s.jobs.filter((j) => j.due <= s.tick);
      const remaining = s.jobs.filter((j) => j.due > s.tick);
      const load = due.length;

      // overload feedback: the more load this tick, the more the service fails
      const effFail = Math.min(
        0.97,
        failRate / 100 + (feedback ? Math.max(0, load - 8) * 0.02 : 0)
      );

      const next: Job[] = [];
      due.forEach((j) => {
        s.attempts += 1;
        if (Math.random() > effFail) {
          s.success += 1;
        } else if (j.attempt < maxRetries && strategy !== "none") {
          next.push({ attempt: j.attempt + 1, due: s.tick + retryDelay(strategy, j.attempt) });
        } else {
          s.failed += 1;
        }
      });

      s.jobs = [...remaining, ...next];
      s.peak = Math.max(s.peak, load);
      s.history = [...s.history, load].slice(-WINDOW);

      setView({
        load,
        peak: s.peak,
        inflight: s.jobs.length,
        requests: s.requests,
        attempts: s.attempts,
        success: s.success,
        failed: s.failed,
        history: [...s.history],
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [running]);

  function reset() {
    setRunning(false);
    sim.current = { jobs: [], tick: 0, requests: 0, attempts: 0, success: 0, failed: 0, peak: 0, history: [] };
    setView({ load: 0, peak: 0, inflight: 0, requests: 0, attempts: 0, success: 0, failed: 0, history: [] });
  }

  const amp = view.requests ? view.attempts / view.requests : 0;
  const successRate = view.success + view.failed ? (view.success / (view.success + view.failed)) * 100 : 0;
  const maxBar = Math.max(8, ...view.history, view.peak);

  return (
    <div className="flex flex-col gap-8">
      <Note>
        When a request to a flaky service fails, you retry. Simple — until a
        real outage hits and <em>every</em> client retries at the same moment,
        burying the service under far more load than normal and turning a blip
        into a full outage. The <strong>retry strategy</strong> decides whether
        you help the service recover or finish it off.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6">
        <Segmented<Strategy>
          label="retry strategy"
          value={strategy}
          onChange={setStrategy}
          options={[
            { value: "none", label: "No retries" },
            { value: "immediate", label: "Immediate" },
            { value: "backoff", label: "Exp backoff" },
            { value: "jitter", label: "Backoff + jitter" },
          ]}
        />
        <div className="grid gap-5 border-t border-[var(--hairline)] pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Slider label="failure rate" min={0} max={95} value={failRate} onChange={setFailRate} display={`${failRate}%`} />
          <Slider label="max retries" min={0} max={6} value={maxRetries} onChange={setMaxRetries} />
          <Slider label="request rate" min={1} max={8} value={clientRate} onChange={setClientRate} display={`${clientRate}/tick`} />
          <div>
            <label className="mono-label flex items-center justify-between text-[var(--slate)]">
              overload feedback
              <button
                role="switch"
                aria-checked={feedback}
                onClick={() => setFeedback((v) => !v)}
                className={`relative h-5 w-9 rounded-full transition-colors ${feedback ? "bg-[var(--coral)]" : "bg-[var(--hairline)]"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${feedback ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </label>
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              load makes the service fail more
            </p>
          </div>
        </div>
      </Panel>

      <div className="flex gap-2">
        <ActionButton onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</ActionButton>
        <ActionButton variant="ghost" onClick={reset}>Reset</ActionButton>
      </div>

      <p className="text-[15px] leading-[1.6] text-[var(--slate)]">{STRATEGY_NOTE[strategy]}</p>

      {/* Load-over-time chart */}
      <Panel tone="ink" className="p-6 sm:p-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="mono-label text-white/45">attempts hitting the service / tick</span>
          <span className="font-mono text-[11px] text-[var(--coral-soft)]">peak {view.peak}</span>
        </div>
        <div className="flex h-44 items-end gap-1">
          {Array.from({ length: WINDOW }).map((_, i) => {
            const offset = WINDOW - view.history.length;
            const val = i >= offset ? view.history[i - offset] : 0;
            const h = (val / maxBar) * 100;
            const hot = val > maxBar * 0.66;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-[2px] transition-all duration-200 ${hot ? "bg-[var(--coral)]" : "bg-[#50e3c2]"}`}
                style={{ height: `${Math.max(2, h)}%`, opacity: i >= offset ? 1 : 0.15 }}
              />
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[11px] text-white/35">
          flat &amp; low = healthy · tall spikes = retry storm
        </p>
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <Metric label="requests" value={`${view.requests}`} />
        <Metric label="total attempts" value={`${view.attempts}`} />
        <Metric label="amplification" value={`${amp.toFixed(2)}×`} accent={amp > 2} />
        <Metric label="success rate" value={`${Math.round(successRate)}%`} accent={successRate < 60} />
        <Metric label="in flight" value={`${view.inflight}`} accent={view.inflight > 200} />
      </Panel>

      <Note>
        Compare the chart across strategies at a high failure rate.{" "}
        <strong>Immediate</strong> retries stack into towering spikes — every
        failed request comes straight back. <strong>Backoff</strong> lowers them;{" "}
        <strong>backoff + jitter</strong> flattens the load almost completely,
        because randomness breaks the synchronisation. Turn on{" "}
        <strong>overload feedback</strong> and the difference becomes
        existential: naive retries drive the failure rate up, which triggers
        more retries — a death spiral that jitter quietly avoids.
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
