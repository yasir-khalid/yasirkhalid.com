"use client";

import { useState } from "react";
import { Callout, Note, Panel, Slider } from "@/components/lab/ui";

// =====================================================================
// Design a key-value store (Alex Xu vol.1, ch.6). The heart of it: the
// N / W / R quorum dial, and the W + R > N overlap that buys strong reads.
// =====================================================================

export default function KeyValueStore() {
  const [n, setN] = useState(3);
  const [w, setW] = useState(2);
  const [r, setR] = useState(2);
  const [down, setDown] = useState<Set<number>>(new Set());

  function setNodes(next: number) {
    setN(next);
    setW((v) => Math.min(v, next));
    setR((v) => Math.min(v, next));
    setDown((d) => new Set([...d].filter((i) => i < next)));
  }
  function toggle(i: number) {
    setDown((d) => {
      const c = new Set(d);
      if (c.has(i)) c.delete(i);
      else c.add(i);
      return c;
    });
  }

  const up = n - down.size;
  const writeOk = up >= w;
  const readOk = up >= r;
  const strong = w + r > n;

  // write quorum reaches the first W replicas (clockwise), read the last R.
  const inWrite = (i: number) => i < w;
  const inRead = (i: number) => i >= n - r;

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A key-value store survives failure by keeping <strong>N replicas</strong>{" "}
        of every key (placed with consistent hashing). The trade-off lives in two
        dials: a write must be acked by <strong>W</strong> replicas, a read must
        hear back from <strong>R</strong>. Tune them against latency, availability
        and consistency.
      </Note>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Panel className="flex flex-col gap-6 self-start p-6">
          <Slider label="N · replicas" min={1} max={7} value={n} onChange={setNodes} />
          <Slider label="W · write quorum" min={1} max={n} value={w} onChange={setW} />
          <Slider label="R · read quorum" min={1} max={n} value={r} onChange={setR} />
          <p className="text-[13px] leading-[1.5] text-[var(--mute)]">
            Click a replica below to take it offline and watch whether writes and
            reads can still reach quorum.
          </p>
        </Panel>

        <div className="flex flex-col gap-5">
          {/* replicas */}
          <Panel tone="stone" className="p-6">
            <p className="mono-label text-[var(--mute)]">replicas · click to fail</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {Array.from({ length: n }).map((_, i) => {
                const isDown = down.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className={`flex h-16 w-16 flex-col items-center justify-center rounded-[12px] border text-[12px] font-medium transition-all ${
                      isDown
                        ? "border-[rgba(226,59,74,0.4)] bg-[rgba(226,59,74,0.08)] text-[var(--accent-danger)] line-through"
                        : "border-[var(--hairline-light)] bg-white text-[var(--ink)]"
                    }`}
                  >
                    <span className="font-mono">s{i}</span>
                    <span className="mt-1 text-[10px] text-[var(--stone-text)]">{isDown ? "down" : "up"}</span>
                  </button>
                );
              })}
            </div>

            {/* quorum brackets */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex gap-3">
                {Array.from({ length: n }).map((_, i) => (
                  <div key={i} className={`h-2 w-16 rounded-full ${inWrite(i) ? "bg-[var(--primary)]" : "bg-[var(--hairline-light)]"}`} />
                ))}
              </div>
              <span className="font-mono text-[11px] text-[var(--primary)]">W = {w} write acks</span>
              <div className="mt-2 flex gap-3">
                {Array.from({ length: n }).map((_, i) => (
                  <div key={i} className={`h-2 w-16 rounded-full ${inRead(i) ? "bg-[var(--accent-teal)]" : "bg-[var(--hairline-light)]"}`} />
                ))}
              </div>
              <span className="font-mono text-[11px] text-[var(--accent-teal)]">R = {r} read responses</span>
            </div>
          </Panel>

          {/* verdicts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
              <p className="mono-label text-[10px] text-[var(--stone-text)]">write</p>
              <p className="display mt-1.5 text-[1.5rem]" style={{ color: writeOk ? "var(--accent-teal)" : "var(--accent-danger)" }}>
                {writeOk ? "ok" : "fails"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[var(--mute)]">{up} up ≥ {w}?</p>
            </div>
            <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
              <p className="mono-label text-[10px] text-[var(--stone-text)]">read</p>
              <p className="display mt-1.5 text-[1.5rem]" style={{ color: readOk ? "var(--accent-teal)" : "var(--accent-danger)" }}>
                {readOk ? "ok" : "fails"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[var(--mute)]">{up} up ≥ {r}?</p>
            </div>
            <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
              <p className="mono-label text-[10px] text-[var(--stone-text)]">consistency</p>
              <p className="display mt-1.5 text-[1.5rem]" style={{ color: strong ? "var(--accent-teal)" : "var(--accent-warning)" }}>
                {strong ? "strong" : "eventual"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[var(--mute)]">W+R {strong ? ">" : "≤"} N</p>
            </div>
          </div>
        </div>
      </div>

      <Callout label="// why W + R > N means strong reads" tone={strong ? "info" : "warn"}>
        With <strong>W + R &gt; N</strong> the write set and the read set must
        share at least one replica - so every read is guaranteed to touch a node
        that saw the latest write. {strong
          ? `Right now ${w} + ${r} > ${n}: reads always see the freshest value.`
          : `Right now ${w} + ${r} ≤ ${n}: the two sets can miss each other, so a read may return stale data until replicas converge.`}{" "}
        The classic balanced choice is <strong>N=3, W=2, R=2</strong>. Set W=1 for
        fast writes, R=1 for fast reads - each trades away the overlap.
      </Callout>

      <Note>
        Dynamo and Cassandra default to <strong>eventual consistency</strong>
        (W+R≤N) for availability, then reconcile concurrent writes with vector
        clocks. The dial isn&apos;t about right or wrong - it&apos;s about which
        failure you can tolerate: a slow request, or a stale one.
      </Note>
    </div>
  );
}
