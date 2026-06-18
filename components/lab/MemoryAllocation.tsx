"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButton, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

type Fit = "first" | "best" | "worst";

const N = 80; // heap cells
const PALETTE = ["#ff7759", "#50b07f", "#1863dc", "#9a7b00", "#7c5cbf", "#0f766e", "#c2412a", "#2563a8"];

type Run = { start: number; len: number };

function freeRuns(cells: number[]): Run[] {
  const runs: Run[] = [];
  let start = -1;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 0) {
      if (start === -1) start = i;
    } else if (start !== -1) {
      runs.push({ start, len: i - start });
      start = -1;
    }
  }
  if (start !== -1) runs.push({ start, len: cells.length - start });
  return runs;
}

export default function MemoryAllocation() {
  const [cells, setCells] = useState<number[]>(() => Array(N).fill(0));
  const [fit, setFit] = useState<Fit>("first");
  const [size, setSize] = useState(4);
  const [failed, setFailed] = useState(0);
  const [flash, setFlash] = useState<Run[] | "fail" | null>(null);
  const [auto, setAuto] = useState(false);

  const idRef = useRef(1);
  const stateRef = useRef({ cells, fit });
  stateRef.current = { cells, fit };

  function place(cells: number[], fit: Fit, size: number): number[] | null {
    const runs = freeRuns(cells).filter((r) => r.len >= size);
    if (runs.length === 0) return null;
    let chosen = runs[0];
    if (fit === "best") chosen = runs.reduce((a, b) => (b.len < a.len ? b : a));
    if (fit === "worst") chosen = runs.reduce((a, b) => (b.len > a.len ? b : a));
    const id = idRef.current++;
    const next = [...cells];
    for (let i = chosen.start; i < chosen.start + size; i++) next[i] = id;
    return next;
  }

  function allocate(sz: number) {
    const next = place(stateRef.current.cells, stateRef.current.fit, sz);
    if (!next) {
      setFailed((f) => f + 1);
      setFlash("fail");
      setTimeout(() => setFlash(null), 400);
      return false;
    }
    setCells(next);
    return true;
  }

  function freeId(id: number) {
    if (id === 0) return;
    setCells((prev) => prev.map((c) => (c === id ? 0 : c)));
  }

  function freeRandom() {
    const ids = Array.from(new Set(stateRef.current.cells.filter((c) => c !== 0)));
    if (ids.length === 0) return;
    freeId(ids[Math.floor(Math.random() * ids.length)]);
  }

  function reset() {
    setAuto(false);
    setCells(Array(N).fill(0));
    setFailed(0);
    idRef.current = 1;
  }

  // auto churn — keeps the heap busy so fragmentation emerges naturally
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      const used = stateRef.current.cells.filter((c) => c !== 0).length;
      const r = Math.random();
      if (used > N * 0.68 || (used > N * 0.45 && r < 0.5)) freeRandom();
      else allocate(2 + Math.floor(Math.random() * 7));
    }, 500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  // metrics
  const { usedCells, freeCells, runs, largest } = useMemo(() => {
    const used = cells.filter((c) => c !== 0).length;
    const rs = freeRuns(cells);
    const lg = rs.reduce((m, r) => Math.max(m, r.len), 0);
    return { usedCells: used, freeCells: N - used, runs: rs, largest: lg };
  }, [cells]);

  const fragmentation = freeCells > 0 ? Math.round((1 - largest / freeCells) * 100) : 0;
  const canFitSize = runs.some((r) => r.len >= size);

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A heap is just one long row of memory. <strong>malloc(n)</strong> has to
        find <em>n contiguous free cells</em>; <strong>free</strong> hands a
        block back. The catch: after a churn of allocations and frees, the free
        space gets carved into scattered gaps. You can have plenty of memory
        free and still fail a request — because no single gap is big enough.
        That&apos;s <strong>fragmentation</strong>.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <Segmented<Fit>
          label="placement strategy"
          value={fit}
          onChange={setFit}
          options={[
            { value: "first", label: "First-fit" },
            { value: "best", label: "Best-fit" },
            { value: "worst", label: "Worst-fit" },
          ]}
        />
        <div className="w-full max-w-[220px]">
          <Slider label="allocation size" min={1} max={12} value={size} onChange={setSize} display={`${size} cells`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => allocate(size)} disabled={!canFitSize}>
            malloc({size})
          </ActionButton>
          <ActionButton variant="ghost" onClick={freeRandom}>free()</ActionButton>
          <ActionButton variant="ghost" onClick={() => setAuto((a) => !a)}>
            {auto ? "Stop churn" : "Auto-churn"}
          </ActionButton>
          <ActionButton variant="ghost" onClick={reset}>Reset</ActionButton>
        </div>
      </Panel>

      {/* Heap */}
      <Panel tone="ink" className="p-6 sm:p-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="mono-label text-white/45">heap · {N} cells · click a block to free it</span>
          <span className="font-mono text-[11px] text-white/40">
            largest free run: {largest}
          </span>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(20, minmax(0,1fr))` }}>
          {cells.map((c, i) => {
            const isFlashFail = flash === "fail" && c === 0;
            return (
              <button
                key={i}
                onClick={() => freeId(c)}
                disabled={c === 0}
                title={c === 0 ? `cell ${i} · free` : `block #${c} · click to free`}
                className={`aspect-square rounded-[3px] transition-all ${c === 0 ? "cursor-default" : "cursor-pointer hover:opacity-80"}`}
                style={{
                  background: c === 0 ? "rgba(255,255,255,0.06)" : PALETTE[c % PALETTE.length],
                  boxShadow: isFlashFail ? "inset 0 0 0 1px var(--coral)" : "none",
                }}
              />
            );
          })}
        </div>
        {flash === "fail" && (
          <p className="mt-3 text-[12px] text-[var(--coral-soft)]">
            ⚠ malloc({size}) failed — {freeCells} cells free, but the largest
            contiguous gap is only {largest}.
          </p>
        )}
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <Metric label="used" value={`${Math.round((usedCells / N) * 100)}%`} />
        <Metric label="free cells" value={`${freeCells}`} />
        <Metric label="free gaps" value={`${runs.length}`} accent={runs.length > 4} />
        <Metric label="largest gap" value={`${largest}`} />
        <Metric label="fragmentation" value={`${fragmentation}%`} accent={fragmentation > 40} />
        <Metric label="failed allocs" value={`${failed}`} accent={failed > 0} />
      </Panel>

      <Note>
        Run <strong>auto-churn</strong> for a few seconds and watch the gaps
        multiply. Then compare strategies: <strong>first-fit</strong> is fast
        but litters small gaps near the start; <strong>best-fit</strong> packs
        tightly yet leaves slivers too small to reuse; <strong>worst-fit</strong>{" "}
        always splits the biggest gap, so it fragments fastest of all. This is
        why real allocators bucket by size, and why long-running processes need
        compaction or a garbage collector that can move objects to close the
        gaps.
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
