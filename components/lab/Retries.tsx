"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

type Strategy = "none" | "fixed" | "exponential" | "jitter";

type Attempt = { id: number; tries: number; fireAt: number };

const TICK_MS = 500;
const SERVER_CAPACITY = 10; // attempts/tick the server can handle before it's "buried"

// Backoff delay (in ticks) before the next attempt, given how many tries so far.
function backoff(strategy: Strategy, tries: number): number {
  switch (strategy) {
    case "none":
      return 1; // retry on the very next tick (tight loop)
    case "fixed":
      return 2;
    case "exponential":
      return Math.min(16, 2 ** tries);
    case "jitter":
      return Math.max(1, Math.round(2 ** tries * (0.5 + Math.random())));
  }
}

export default function Retries() {
  const [strategy, setStrategy] = useState<Strategy>("none");
  const [failureRate, setFailureRate] = useState(80); // % of attempts that fail
  const [maxTries, setMaxTries] = useState(5);
  const [clients, setClients] = useState(6); // new requests per tick
  const [running, setRunning] = useState(false);

  const [loadHistory, setLoadHistory] = useState<number[]>([]);
  const [stats, setStats] = useState({ requests: 0, attempts: 0, succeeded: 0, failed: 0, peak: 0 });

  const idRef = useRef(0);
  const tickRef = useRef(0);
  const pendingRef = useRef<Attempt[]>([]);
  const cfg = useRef({ strategy, failureRate, maxTries, clients });
  cfg.current = { strategy, failureRate, maxTries, clients };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const now = ++tickRef.current;
      const { strategy, failureRate, maxTries, clients } = cfg.current;

      // 1. new requests enter (each is a fresh logical request, attempt 1)
      for (let i = 0; i < clients; i++) {
        pendingRef.current.push({ id: idRef.current++, tries: 0, fireAt: now });
      }
      const newRequests = clients;

      // 2. fire all attempts scheduled for now → that's this tick's server load
      const firing = pendingRef.current.filter((a) => a.fireAt <= now);
      pendingRef.current = pendingRef.current.filter((a) => a.fireAt > now);

      let succeeded = 0;
      let failedFinal = 0;
      const requeue: Attempt[] = [];
      for (const a of firing) {
        const tries = a.tries + 1;
        const ok = Math.random() * 100 >= failureRate;
        if (ok) {
          succeeded++;
        } else if (tries >= maxTries) {
          failedFinal++; // gave up
        } else {
          requeue.push({ ...a, tries, fireAt: now + backoff(strategy, tries) });
        }
      }
      pendingRef.current.push(...requeue);

      const load = firing.length;
      setLoadHistory((h) => [...h.slice(-39), load]);
      setStats((s) => ({
        requests: s.requests + newRequests,
        attempts: s.attempts + load,
        succeeded: s.succeeded + succeeded,
        failed: s.failed + failedFinal,
        peak: Math.max(s.peak, load),
      }));
    }, TICK_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function reset() {
    setRunning(false);
    pendingRef.current = [];
    tickRef.current = 0;
    setLoadHistory([]);
    setStats({ requests: 0, attempts: 0, succeeded: 0, failed: 0, peak: 0 });
  }

  const amplification = stats.requests ? stats.attempts / stats.requests : 0;
  const successRate = stats.requests ? (stats.succeeded / stats.requests) * 100 : 0;
  const currentLoad = loadHistory[loadHistory.length - 1] ?? 0;
  const buried = currentLoad > SERVER_CAPACITY;
  const maxBar = Math.max(SERVER_CAPACITY, ...loadHistory, 1);

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Retrying a failed request is the most natural instinct in distributed
        systems - and one of the most dangerous. When a service wobbles, every
        client retries at once, <em>multiplying</em> the load on the very server
        that&apos;s already struggling. That feedback loop is a{" "}
        <strong>retry storm</strong>. The fix isn&apos;t &ldquo;don&apos;t
        retry&rdquo; - it&apos;s <strong>how</strong> you space them out.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6">
        <Segmented<Strategy>
          label="retry strategy"
          value={strategy}
          onChange={setStrategy}
          options={[
            { value: "none", label: "Immediate" },
            { value: "fixed", label: "Fixed delay" },
            { value: "exponential", label: "Exp. backoff" },
            { value: "jitter", label: "Backoff + jitter" },
          ]}
        />
        <div className="flex flex-wrap items-end gap-6">
          <div className="w-full max-w-[200px]">
            <Slider label="failure rate" min={0} max={100} value={failureRate} onChange={setFailureRate} display={`${failureRate}%`} />
          </div>
          <div className="w-full max-w-[160px]">
            <Slider label="max attempts" min={1} max={8} value={maxTries} onChange={setMaxTries} />
          </div>
          <div className="w-full max-w-[160px]">
            <Slider label="new req/tick" min={1} max={10} value={clients} onChange={setClients} />
          </div>
          <div className="flex gap-2">
            <ActionButton onClick={() => setRunning((r) => !r)}>
              {running ? "⏸ Pause" : "▶ Start simulation"}
            </ActionButton>
            <ActionButton variant="ghost" onClick={reset}>Reset</ActionButton>
          </div>
        </div>
      </Panel>

      {/* Server load over time */}
      <Panel tone="stone" className="p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[var(--mute)]">server load · attempts per tick</span>
          <span
            className={`rounded-full px-3 py-1 font-mono text-[11px] ${
              buried ? "bg-[#fdeced] text-[var(--accent-danger)]" : "bg-[rgba(0,168,126,0.1)] text-[var(--accent-teal)]"
            }`}
          >
            {currentLoad} / {SERVER_CAPACITY} {buried ? "· buried" : "· coping"}
          </span>
        </div>

        <div className="relative mt-5 flex h-40 items-end gap-[3px] rounded-[10px] border border-[var(--hairline-light)] bg-white p-3">
          {/* capacity line */}
          <div
            className="pointer-events-none absolute inset-x-3 border-t border-dashed border-[var(--accent-danger)]/50"
            style={{ bottom: `calc(0.75rem + ${(SERVER_CAPACITY / maxBar) * 100}% )` }}
          />
          {loadHistory.length === 0 && (
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-[var(--stone-text)]">
              press start
            </span>
          )}
          {loadHistory.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[3px] transition-all"
              style={{
                height: `${(v / maxBar) * 100}%`,
                background: v > SERVER_CAPACITY ? "var(--accent-danger)" : "var(--accent-teal)",
                minHeight: v > 0 ? "3px" : "0",
              }}
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] text-[var(--stone-text)]">
          dashed line = server capacity · bars above it = overload caused by piled-up retries
        </p>
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-x-10 gap-y-6 p-5">
        <div>
          <p className="mono-label text-[var(--mute)]">requests</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">{stats.requests}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">total attempts</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">{stats.attempts}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">amplification</p>
          <p className="display mt-1 text-[24px]" style={{ color: amplification > 2 ? "var(--accent-danger)" : "var(--ink)" }}>
            {amplification.toFixed(1)}×
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">peak load</p>
          <p className="display mt-1 text-[24px]" style={{ color: stats.peak > SERVER_CAPACITY ? "var(--accent-danger)" : "var(--ink)" }}>
            {stats.peak}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">eventual success</p>
          <p className="display mt-1 text-[24px] text-[var(--accent-teal)]">{successRate.toFixed(0)}%</p>
        </div>
      </Panel>

      <Note>
        Set failure rate high and start with <strong>Immediate</strong>: every
        failure retries next tick, attempts stack on attempts, and the load bars
        blow past capacity - a textbook retry storm. <strong>Fixed delay</strong>{" "}
        helps a little. <strong>Exponential backoff</strong> spaces retries out
        geometrically (1, 2, 4, 8…) so the server gets breathing room. But pure
        backoff still <em>synchronises</em> - all the clients that failed
        together retry together. <strong>Backoff + jitter</strong> randomises
        each delay, smearing the retries across time so the peak load stays
        flat. Watch the <em>amplification</em> and <em>peak load</em> drop as you
        step down the list.
      </Note>
    </div>
  );
}
