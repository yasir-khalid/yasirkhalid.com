"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel, Slider } from "@/components/lab/ui";

// =====================================================================
// Design a key-value store (Alex Xu vol.1, ch.6). The N / W / R quorum dial,
// made concrete: write a new version to W replicas, read from R, and watch
// whether the read is fresh or stale. W + R > N guarantees fresh.
// =====================================================================

export default function KeyValueStore() {
  const [n, setN] = useState(5);
  const [w, setW] = useState(3);
  const [r, setR] = useState(3);
  const [versions, setVersions] = useState<number[]>(() => Array(5).fill(1));
  const [down, setDown] = useState<Set<number>>(new Set());
  const [pulse, setPulse] = useState<{ set: Set<number>; kind: "write" | "read" } | null>(null);
  const [readResult, setReadResult] = useState<{ got: number; fresh: boolean } | null>(null);
  const gv = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setNodes(next: number) {
    setN(next);
    setW((v) => Math.min(v, next));
    setR((v) => Math.min(v, next));
    setVersions((vs) => Array.from({ length: next }, (_, i) => vs[i] ?? 1));
    setDown((d) => new Set([...d].filter((i) => i < next)));
    setReadResult(null);
  }
  function toggle(i: number) {
    setDown((d) => {
      const c = new Set(d);
      if (c.has(i)) c.delete(i);
      else c.add(i);
      return c;
    });
    setReadResult(null);
  }

  const inWrite = (i: number) => i < w;
  const inRead = (i: number) => i >= n - r;
  const overlap = (i: number) => inWrite(i) && inRead(i);

  const up = n - down.size;
  const writeReachable = Array.from({ length: w }, (_, i) => i).every((i) => !down.has(i));
  const readReachable = Array.from({ length: r }, (_, i) => n - 1 - i).every((i) => !down.has(i));
  const strong = w + r > n;

  function flash(set: Set<number>, kind: "write" | "read") {
    setPulse({ set, kind });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPulse(null), 900);
  }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function doWrite() {
    if (!writeReachable) { flash(new Set(), "write"); setReadResult(null); return; }
    const v = ++gv.current;
    const set = new Set<number>();
    for (let i = 0; i < w; i++) set.add(i);
    setVersions((vs) => vs.map((old, i) => (set.has(i) ? v : old)));
    setReadResult(null);
    flash(set, "write");
  }
  function doRead() {
    if (!readReachable) { flash(new Set(), "read"); setReadResult(null); return; }
    const set = new Set<number>();
    for (let i = 0; i < r; i++) set.add(n - 1 - i);
    const got = Math.max(...[...set].map((i) => versions[i]));
    setReadResult({ got, fresh: got === gv.current });
    flash(set, "read");
  }

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A key-value store keeps <strong>N replicas</strong> of every key. A write
        must be acked by <strong>W</strong> of them; a read must hear back from{" "}
        <strong>R</strong>. Write a new version below, then read it back - and
        watch whether the read catches the latest value or a stale one.
      </Note>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
        <Panel className="flex flex-col gap-6 self-start p-6">
          <Slider label="N · replicas" min={1} max={7} value={n} onChange={setNodes} />
          <Slider label="W · write quorum" min={1} max={n} value={w} onChange={(v) => { setW(v); setReadResult(null); }} />
          <Slider label="R · read quorum" min={1} max={n} value={r} onChange={(v) => { setR(v); setReadResult(null); }} />
          <div className="flex gap-2">
            <ActionButton onClick={doWrite}>Write v{gv.current + 1}</ActionButton>
            <ActionButton variant="ghost" onClick={doRead}>Read</ActionButton>
          </div>
          <p className="text-[12px] leading-[1.5] text-[var(--mute)]">
            Click a replica to fail it. Cobalt = write set, teal = read set, both
            = overlap (the node that carries the fresh write into the read).
          </p>
        </Panel>

        <div className="flex flex-col gap-5">
          {/* replica row */}
          <Panel tone="stone" className="p-6">
            <p className="mono-label text-[var(--mute)]">replicas · version stored on each</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {Array.from({ length: n }).map((_, i) => {
                const isDown = down.has(i);
                const ov = overlap(i);
                const w_ = inWrite(i);
                const r_ = inRead(i);
                const pulsing = pulse?.set.has(i);
                const border = ov ? "var(--ink)" : w_ ? "var(--primary)" : r_ ? "var(--accent-teal)" : "var(--hairline-light)";
                const tint = isDown
                  ? "rgba(226,59,74,0.07)"
                  : ov ? "rgba(73,79,223,0.06)" : w_ ? "rgba(73,79,223,0.06)" : r_ ? "rgba(0,168,126,0.06)" : "#fff";
                return (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className={`relative flex h-20 w-[68px] flex-col items-center justify-center gap-1 rounded-[12px] border-2 transition-all ${pulsing ? "lab-pop" : ""}`}
                    style={{ borderColor: isDown ? "rgba(226,59,74,0.4)" : border, background: tint }}
                  >
                    {ov && !isDown && (
                      <span className="absolute -top-2 rounded-full bg-[var(--ink)] px-1.5 py-0.5 font-mono text-[7px] uppercase text-white">overlap</span>
                    )}
                    <span className={`font-mono text-[12px] ${isDown ? "text-[var(--accent-danger)]" : "text-[var(--stone-text)]"}`}>s{i}</span>
                    <span className={`font-mono text-[16px] font-semibold ${isDown ? "text-[var(--accent-danger)] line-through" : "text-[var(--ink)]"}`}>
                      v{versions[i]}
                    </span>
                    <span className="font-mono text-[8px] uppercase" style={{ color: isDown ? "var(--accent-danger)" : w_ ? "var(--primary)" : r_ ? "var(--accent-teal)" : "var(--stone-text)" }}>
                      {isDown ? "down" : w_ && r_ ? "W·R" : w_ ? "write" : r_ ? "read" : "idle"}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* read result */}
          {readResult && (
            <div className={`rounded-[14px] p-4 ring-1 ${readResult.fresh ? "bg-[rgba(0,168,126,0.06)] ring-[rgba(0,168,126,0.3)]" : "bg-[rgba(236,126,0,0.07)] ring-[rgba(236,126,0,0.35)]"}`}>
              <p className="text-[15px] text-[var(--ink)]">
                Read returned <b className="font-mono">v{readResult.got}</b> -{" "}
                {readResult.fresh ? (
                  <span className="font-medium text-[var(--accent-teal)]">fresh ✓ it matches the latest write</span>
                ) : (
                  <span className="font-medium text-[var(--accent-warning)]">stale ✗ the read set missed the newest version</span>
                )}
              </p>
            </div>
          )}

          {/* verdicts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
              <p className="mono-label text-[10px] text-[var(--stone-text)]">write</p>
              <p className="display mt-1.5 text-[1.4rem]" style={{ color: writeReachable ? "var(--accent-teal)" : "var(--accent-danger)" }}>{writeReachable ? "ok" : "blocked"}</p>
              <p className="mt-1 font-mono text-[11px] text-[var(--mute)]">needs {w} acks</p>
            </div>
            <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
              <p className="mono-label text-[10px] text-[var(--stone-text)]">read</p>
              <p className="display mt-1.5 text-[1.4rem]" style={{ color: readReachable ? "var(--accent-teal)" : "var(--accent-danger)" }}>{readReachable ? "ok" : "blocked"}</p>
              <p className="mt-1 font-mono text-[11px] text-[var(--mute)]">needs {r} replies</p>
            </div>
            <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
              <p className="mono-label text-[10px] text-[var(--stone-text)]">W + R vs N</p>
              <p className="display mt-1.5 text-[1.4rem]" style={{ color: strong ? "var(--accent-teal)" : "var(--accent-warning)" }}>{w + r} {strong ? ">" : "≤"} {n}</p>
              <p className="mt-1 font-mono text-[11px] text-[var(--mute)]">{strong ? "strong" : "eventual"}</p>
            </div>
          </div>
        </div>
      </div>

      <Callout label="// the overlap is everything" tone={strong ? "info" : "warn"}>
        {strong ? (
          <>With <strong>W + R &gt; N</strong> the write set and read set are forced to
          share at least one replica (marked <b>overlap</b>) - so a read always
          touches a node that saw the latest write. Reads are always fresh. Try
          N=3, W=2, R=2.</>
        ) : (
          <>With <strong>W + R ≤ N</strong> there&apos;s no overlap: the read set can sit
          entirely on replicas that never received the newest write, so reads come
          back <strong>stale</strong> until replication catches up. Nudge W or R up
          until the overlap badge appears.</>
        )}
      </Callout>

      <Note>
        This is the dial behind Dynamo and Cassandra. W=1 gives fast writes, R=1
        fast reads - each shrinks the sets until they no longer overlap. It&apos;s
        not about right or wrong, but which you can tolerate: a slow request, or a
        stale one.
      </Note>
    </div>
  );
}
