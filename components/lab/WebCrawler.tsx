"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel } from "@/components/lab/ui";

// =====================================================================
// Design a web crawler (Alex Xu vol.1, ch.9). A BFS over the URL frontier
// (a FIFO queue), with a "content seen?" check to skip duplicate pages.
// =====================================================================

type N = { id: string; x: number; y: number; host: string; content: string };

const NODES: N[] = [
  { id: "A", x: 40, y: 120, host: "a.com", content: "p1" },
  { id: "B", x: 110, y: 55, host: "a.com", content: "p2" },
  { id: "C", x: 110, y: 185, host: "b.com", content: "p3" },
  { id: "D", x: 190, y: 110, host: "b.com", content: "p4" },
  { id: "E", x: 195, y: 205, host: "c.com", content: "p5" },
  { id: "F", x: 275, y: 150, host: "c.com", content: "p6" },
  { id: "G", x: 270, y: 55, host: "b.com", content: "p3" }, // dup of C
  { id: "H", x: 335, y: 120, host: "d.com", content: "p7" },
];
const EDGES: [string, string][] = [
  ["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["C", "E"],
  ["D", "F"], ["E", "G"], ["E", "F"], ["F", "H"], ["G", "H"],
];
const byId = (id: string) => NODES.find((n) => n.id === id)!;
const outLinks = (id: string) => EDGES.filter(([u]) => u === id).map(([, v]) => v);

type State = {
  frontier: string[];
  visited: string[];
  seen: string[];
  dups: string[];
  current: string | null;
};
const INITIAL: State = { frontier: ["A"], visited: [], seen: [], dups: [], current: null };

function next(s: State): State {
  if (s.frontier.length === 0) return { ...s, current: null };
  const [u, ...rest] = s.frontier;
  if (s.visited.includes(u)) return { ...s, frontier: rest };
  const node = byId(u);
  const visited = [...s.visited, u];
  const dup = s.seen.includes(node.content);
  const seen = dup ? s.seen : [...s.seen, node.content];
  let frontier = rest;
  if (!dup) {
    for (const v of outLinks(u)) {
      if (!visited.includes(v) && !frontier.includes(v)) frontier = [...frontier, v];
    }
  }
  return { frontier, visited, seen, dups: dup ? [...s.dups, u] : s.dups, current: u };
}

export default function WebCrawler() {
  const [s, setS] = useState<State>(INITIAL);
  const [running, setRunning] = useState(false);
  const done = s.frontier.length === 0 && s.visited.length > 0;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setS((prev) => {
        const n = next(prev);
        if (n.frontier.length === 0) setRunning(false);
        return n;
      });
    }, 850);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  function stateOf(id: string): "current" | "dup" | "done" | "frontier" | "new" {
    if (s.current === id) return "current";
    if (s.dups.includes(id)) return "dup";
    if (s.visited.includes(id)) return "done";
    if (s.frontier.includes(id)) return "frontier";
    return "new";
  }
  const fill: Record<string, string> = {
    current: "var(--primary)",
    dup: "var(--accent-warning)",
    done: "var(--accent-teal)",
    frontier: "#fff",
    new: "#fff",
  };
  const stroke: Record<string, string> = {
    current: "var(--primary)",
    dup: "var(--accent-warning)",
    done: "var(--accent-teal)",
    frontier: "var(--primary)",
    new: "var(--hairline-strong)",
  };

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Strip a web crawler to its core and it&apos;s a <strong>breadth-first
        search</strong>: pull a URL off the <strong>frontier</strong> (a FIFO
        queue), download it, extract its links, and push the new ones back on.
        Two guards keep it sane - never revisit a URL, and never re-store
        duplicate content.
      </Note>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton onClick={() => setRunning((r) => !r)} disabled={done}>
          {running ? "❚❚ Pause" : "▶ Auto-crawl"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => setS(next)} disabled={running || done}>
          Step →
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => { setRunning(false); setS(INITIAL); }}>
          Reset
        </ActionButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,260px)]">
        {/* graph */}
        <Panel tone="stone" className="p-4">
          <svg viewBox="0 0 375 250" className="w-full" role="img" aria-label="Crawl graph">
            {EDGES.map(([u, v], i) => {
              const a = byId(u);
              const b = byId(v);
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--hairline-light)" strokeWidth={1.5} />;
            })}
            {NODES.map((n) => {
              const st = stateOf(n.id);
              return (
                <g key={n.id} className={st === "current" ? "lab-pop" : ""}>
                  <circle cx={n.x} cy={n.y} r={15} fill={fill[st]} stroke={stroke[st]} strokeWidth={2} />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" className="font-mono" fontSize={12} fontWeight={600}
                    fill={st === "done" || st === "current" || st === "dup" ? "#fff" : "var(--ink)"}>
                    {n.id}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-[var(--mute)]">
            {[
              ["frontier", "var(--primary)"],
              ["downloading", "var(--primary)"],
              ["crawled", "var(--accent-teal)"],
              ["duplicate · skipped", "var(--accent-warning)"],
            ].map(([l, c]) => (
              <span key={l} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c as string }} />
                {l}
              </span>
            ))}
          </div>
        </Panel>

        {/* queue + sets */}
        <div className="flex flex-col gap-4">
          <Panel className="p-5">
            <p className="mono-label text-[var(--mute)]">URL frontier (FIFO)</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.frontier.length === 0 ? (
                <span className="font-mono text-[12px] text-[var(--stone-text)]">empty</span>
              ) : (
                s.frontier.map((id, i) => (
                  <span key={id} className={`grid h-7 w-7 place-items-center rounded-[7px] font-mono text-[12px] ${i === 0 ? "bg-[var(--primary)] text-white" : "border border-[var(--hairline-light)] text-[var(--ink)]"}`}>
                    {id}
                  </span>
                ))
              )}
            </div>
            <p className="mt-2 font-mono text-[10px] text-[var(--stone-text)]">↑ next to download (head of queue)</p>
          </Panel>
          <Panel tone="stone" className="p-5">
            <div className="flex justify-between">
              <span className="mono-label text-[var(--mute)]">crawled</span>
              <span className="font-mono text-[13px] text-[var(--accent-teal)]">{s.visited.length}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="mono-label text-[var(--mute)]">unique pages</span>
              <span className="font-mono text-[13px] text-[var(--ink)]">{s.seen.length}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="mono-label text-[var(--mute)]">dup skipped</span>
              <span className="font-mono text-[13px] text-[var(--accent-warning)]">{s.dups.length}</span>
            </div>
          </Panel>
        </div>
      </div>

      <Callout label="// content seen?" tone="key">
        Page <strong>G</strong> serves the same content as <strong>C</strong> -
        about 29% of the web is duplicated. A <strong>&ldquo;content
        seen?&rdquo;</strong> check (a hash set, or a bloom filter at scale) lets
        the crawler skip storing G again. The frontier queue plus a visited set is
        what turns &ldquo;follow every link&rdquo; into a terminating BFS instead
        of an infinite loop.
      </Callout>

      <Note>
        The piece this leaves out is <strong>politeness</strong>: a real crawler
        throttles itself to one request per host at a time (note how B, C, D and G
        share hosts) so it never hammers a single site - usually with a separate
        per-host queue behind the frontier.
      </Note>
    </div>
  );
}
