"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

type Strategy = "cache-aside" | "read-through" | "write-through" | "write-behind";
type Edge = "app-cache" | "cache-db" | "app-db";

type Step = { edge: Edge; label: string; db?: boolean; async?: boolean };

const LAT = { cache: 2, db: 30 }; // ms

const STRATEGY_INFO: Record<Strategy, string> = {
  "cache-aside":
    "The app owns the cache. It checks the cache first; on a miss it reads the database itself, then stores the result. Writes go to the DB and invalidate the cached copy.",
  "read-through":
    "The cache sits inline. The app only ever talks to the cache - on a miss, the cache fetches from the DB transparently and fills itself.",
  "write-through":
    "Writes go to the cache and the database synchronously, so the cache is never stale. Slower writes, but reads are always fresh.",
  "write-behind":
    "Writes hit the cache and return immediately; the DB is updated asynchronously a moment later. Fast writes, but a crash can lose unflushed data.",
};

function buildRead(strategy: Strategy, hit: boolean): Step[] {
  if (hit) return [{ edge: "app-cache", label: "read → cache HIT" }];
  if (strategy === "read-through")
    return [
      { edge: "app-cache", label: "read → cache MISS" },
      { edge: "cache-db", label: "cache fetches from DB", db: true },
      { edge: "cache-db", label: "DB → cache (fill)" },
      { edge: "app-cache", label: "cache → app" },
    ];
  // cache-aside / write-through reads: app reads DB on miss, then populates
  return [
    { edge: "app-cache", label: "read → cache MISS" },
    { edge: "app-db", label: "app reads DB", db: true },
    { edge: "app-cache", label: "app writes result to cache" },
  ];
}

function buildWrite(strategy: Strategy): Step[] {
  switch (strategy) {
    case "cache-aside":
      return [
        { edge: "app-db", label: "write → DB", db: true },
        { edge: "app-cache", label: "invalidate cache entry" },
      ];
    case "read-through":
    case "write-through":
      return [
        { edge: "app-cache", label: "write → cache" },
        { edge: "cache-db", label: "cache → DB (synchronous)", db: true },
      ];
    case "write-behind":
      return [
        { edge: "app-cache", label: "write → cache (ack now)" },
        { edge: "cache-db", label: "flush to DB (async)", db: true, async: true },
      ];
  }
}

export default function Caching() {
  const [strategy, setStrategy] = useState<Strategy>("cache-aside");
  const [hitRate, setHitRate] = useState(80);
  const [steps, setSteps] = useState<Step[]>([]);
  const [active, setActive] = useState(-1);
  const [stats, setStats] = useState({ ops: 0, hits: 0, dbOps: 0, latency: 0 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function run(seq: Step[]) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSteps(seq);
    setActive(-1);
    seq.forEach((_, i) => {
      timers.current.push(setTimeout(() => setActive(i), i * 700 + 120));
    });
    timers.current.push(setTimeout(() => setActive(-1), seq.length * 700 + 600));
  }

  function sendRead() {
    const hit = Math.random() * 100 < hitRate;
    const seq = buildRead(strategy, hit);
    run(seq);
    const dbTouched = seq.some((s) => s.db);
    setStats((s) => ({
      ops: s.ops + 1,
      hits: s.hits + (hit ? 1 : 0),
      dbOps: s.dbOps + (dbTouched ? 1 : 0),
      latency: s.latency + (hit ? LAT.cache : LAT.cache + LAT.db),
    }));
  }

  function sendWrite() {
    const seq = buildWrite(strategy);
    run(seq);
    const sync = !seq.some((s) => s.async);
    setStats((s) => ({
      ops: s.ops + 1,
      hits: s.hits,
      dbOps: s.dbOps + 1,
      latency: s.latency + (sync ? LAT.cache + LAT.db : LAT.cache),
    }));
  }

  function reset() {
    timers.current.forEach(clearTimeout);
    setSteps([]);
    setActive(-1);
    setStats({ ops: 0, hits: 0, dbOps: 0, latency: 0 });
  }

  const activeEdge = active >= 0 ? steps[active]?.edge : null;
  const isActive = (edges: Edge[]) => !!activeEdge && edges.includes(activeEdge);

  const avgLat = stats.ops ? stats.latency / stats.ops : 0;
  const hitPct = stats.ops ? (stats.hits / stats.ops) * 100 : 0;
  const dbLoad = stats.ops ? (stats.dbOps / stats.ops) * 100 : 0;

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A cache is a small, fast store in front of a slow database. The{" "}
        <strong>strategy</strong> decides who talks to whom, and when - which
        changes how fresh your data is and how much load the database takes.
        Pick one, then fire reads and writes through it.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <Segmented<Strategy>
          label="strategy"
          value={strategy}
          onChange={(s) => {
            setStrategy(s);
            reset();
          }}
          options={[
            { value: "cache-aside", label: "Cache-aside" },
            { value: "read-through", label: "Read-through" },
            { value: "write-through", label: "Write-through" },
            { value: "write-behind", label: "Write-behind" },
          ]}
        />
        <div className="w-full max-w-[220px]">
          <Slider label="cache hit rate" min={0} max={100} value={hitRate} onChange={setHitRate} display={`${hitRate}%`} />
        </div>
        <div className="flex gap-2">
          <ActionButton onClick={sendRead}>Send read</ActionButton>
          <ActionButton variant="ghost" onClick={sendWrite}>Send write</ActionButton>
        </div>
      </Panel>

      <p className="text-[15px] leading-[1.6] text-[var(--slate)]">
        {STRATEGY_INFO[strategy]}
      </p>

      {/* Diagram */}
      <Panel tone="stone" className="p-6 sm:p-10">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* App */}
          <DiagramNode label="App" active={isActive(["app-cache", "app-db"])} />
          {/* edge app-cache */}
          <Connector on={activeEdge === "app-cache"} />
          {/* Cache */}
          <DiagramNode label="Cache" sub="~2 ms" active={isActive(["app-cache", "cache-db"])} tone="mint" />
          {/* edge cache-db */}
          <Connector on={activeEdge === "cache-db"} />
          {/* DB */}
          <DiagramNode label="Database" sub="~30 ms" active={isActive(["cache-db", "app-db"])} tone="coral" />
        </div>

        {/* app-db direct edge indicator */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              activeEdge === "app-db" ? "bg-[var(--primary)]" : "bg-[var(--hairline-light)]"
            }`}
          />
          <span className="font-mono text-[11px] text-[var(--mute)]">
            {strategy === "cache-aside"
              ? "app ↔ database (direct path on miss / write)"
              : "app never touches the database directly"}
          </span>
        </div>

        {/* step log */}
        <div className="mt-6 min-h-[3.5rem] border-t border-[var(--hairline-light)] pt-4">
          {steps.length === 0 ? (
            <p className="font-mono text-[12px] text-[var(--stone-text)]">
              fire a request to trace the path…
            </p>
          ) : (
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px]">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 transition-colors ${
                    i === active
                      ? "font-medium text-[var(--primary)]"
                      : i < active || active === -1
                        ? "text-[var(--body)]"
                        : "text-[var(--faint)]"
                  }`}
                >
                  {i > 0 && <span className="text-[var(--faint)]">→</span>}
                  {s.label}
                </li>
              ))}
            </ol>
          )}
        </div>
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap items-center justify-between gap-6 p-5">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="mono-label text-[var(--muted)]">requests</p>
            <p className="display mt-1 text-[24px] text-[var(--ink)]">{stats.ops}</p>
          </div>
          <div>
            <p className="mono-label text-[var(--muted)]">cache hit rate</p>
            <p className="display mt-1 text-[24px] text-[var(--ink)]">{hitPct.toFixed(0)}%</p>
          </div>
          <div>
            <p className="mono-label text-[var(--muted)]">db load</p>
            <p className="display mt-1 text-[24px] text-[var(--coral)]">{dbLoad.toFixed(0)}%</p>
          </div>
          <div>
            <p className="mono-label text-[var(--muted)]">avg latency</p>
            <p className="display mt-1 text-[24px] text-[var(--ink)]">{avgLat.toFixed(0)} ms</p>
          </div>
        </div>
        <ActionButton variant="ghost" onClick={reset}>Reset</ActionButton>
      </Panel>

      <Note>
        Crank the hit rate up and the <em>db load</em> and <em>avg latency</em>{" "}
        both fall - every cache hit is a database query that never happened.
        But notice the catch each strategy makes: write-through keeps the cache
        perfectly fresh at the cost of slow writes, while write-behind makes
        writes instant but risks losing data that hasn&apos;t flushed yet.
        There is no free lunch - only the trade you choose.
      </Note>
    </div>
  );
}

function DiagramNode({
  label,
  sub,
  active,
  tone = "plain",
}: {
  label: string;
  sub?: string;
  active: boolean;
  tone?: "plain" | "mint" | "coral";
}) {
  const ring =
    tone === "mint"
      ? "var(--accent-teal)"
      : tone === "coral"
        ? "var(--primary)"
        : "var(--ink)";
  const tint =
    tone === "mint"
      ? "rgba(0,168,126,0.08)"
      : tone === "coral"
        ? "rgba(73,79,223,0.08)"
        : "rgba(25,28,31,0.05)";
  return (
    <div
      className="flex min-w-0 flex-1 flex-col items-center rounded-[12px] border bg-white px-2 py-5 text-center transition-all"
      style={{
        borderColor: active ? ring : "var(--hairline-light)",
        background: active ? tint : "#ffffff",
        boxShadow: active ? `0 0 0 1px ${ring}` : "none",
      }}
    >
      <span className="heading text-[15px] text-[var(--ink)] sm:text-[18px]">{label}</span>
      {sub && <span className="mt-1 font-mono text-[10px] text-[var(--stone-text)]">{sub}</span>}
    </div>
  );
}

function Connector({ on }: { on: boolean }) {
  return (
    <div className="relative h-0.5 w-6 shrink-0 bg-[var(--hairline-light)] sm:w-12">
      <div
        className={`absolute inset-0 origin-left bg-[var(--primary)] transition-transform duration-300 ${
          on ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </div>
  );
}
