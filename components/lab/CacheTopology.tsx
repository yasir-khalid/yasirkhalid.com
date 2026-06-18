"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Note, Panel, Segmented } from "@/components/lab/ui";

type Topology = "local" | "distributed";
type Invalidation = "none" | "ttl" | "on-write" | "broadcast";

const POD_COUNT = 3;
const TTL_MS = 5000;

// A cache entry stores the DB version it captured, plus an optional expiry.
type Entry = { version: number; expiresAt: number | null } | null;

const INV_NOTE: Record<Invalidation, string> = {
  none: "No invalidation. Once a value is cached it's never refreshed — every write leaves the caches stale forever.",
  ttl: `Time-to-live. Entries expire automatically after ${TTL_MS / 1000}s, so caches become consistent eventually — but serve stale data until they do.`,
  "on-write":
    "Invalidate on write. The pod that performs the write clears its cache. The catch with local caches: the OTHER pods never hear about it and keep serving stale data.",
  broadcast:
    "Pub/sub broadcast. The write publishes an invalidation message (e.g. Redis pub/sub) that every pod receives, so all local caches clear together.",
};

export default function CacheTopology() {
  const [topology, setTopology] = useState<Topology>("local");
  const [invalidation, setInvalidation] = useState<Invalidation>("none");
  const [dbVersion, setDbVersion] = useState(1);
  const [local, setLocal] = useState<Entry[]>(Array(POD_COUNT).fill(null));
  const [shared, setShared] = useState<Entry>(null);
  const [log, setLog] = useState<string>("Read or update the key to begin.");
  const [stats, setStats] = useState({ reads: 0, hits: 0, misses: 0, stale: 0 });
  const [, force] = useState(0);

  const stateRef = useRef({ topology, invalidation, dbVersion, local, shared });
  stateRef.current = { topology, invalidation, dbVersion, local, shared };

  // TTL sweeper: expire entries whose clock has run out.
  useEffect(() => {
    if (invalidation !== "ttl") return;
    const t = setInterval(() => {
      const now = Date.now();
      setLocal((prev) => prev.map((e) => (e && e.expiresAt && e.expiresAt <= now ? null : e)));
      setShared((e) => (e && e.expiresAt && e.expiresAt <= now ? null : e));
      force((x) => x + 1); // keep countdown labels ticking
    }, 250);
    return () => clearInterval(t);
  }, [invalidation]);

  function entryFor(ver: number): Entry {
    return { version: ver, expiresAt: invalidation === "ttl" ? Date.now() + TTL_MS : null };
  }

  function read(pod: number) {
    const fresh = dbVersion;
    if (topology === "distributed") {
      if (shared === null) {
        setShared(entryFor(fresh));
        setStats((s) => ({ ...s, reads: s.reads + 1, misses: s.misses + 1 }));
        setLog(`Pod ${pod} → Redis MISS → loads v${fresh} from DB and caches it. Every pod now sees v${fresh}.`);
      } else {
        const stale = shared.version < fresh;
        setStats((s) => ({ ...s, reads: s.reads + 1, hits: s.hits + 1, stale: s.stale + (stale ? 1 : 0) }));
        setLog(`Pod ${pod} → Redis HIT → served v${shared.version}${stale ? " — STALE (DB is v" + fresh + ")" : " (fresh)"}.`);
      }
      return;
    }
    // local
    const e = local[pod];
    if (e === null) {
      setLocal((prev) => prev.map((x, i) => (i === pod ? entryFor(fresh) : x)));
      setStats((s) => ({ ...s, reads: s.reads + 1, misses: s.misses + 1 }));
      setLog(`Pod ${pod} local cache MISS → loads v${fresh} from DB into its own cache.`);
    } else {
      const stale = e.version < fresh;
      setStats((s) => ({ ...s, reads: s.reads + 1, hits: s.hits + 1, stale: s.stale + (stale ? 1 : 0) }));
      setLog(`Pod ${pod} local cache HIT → served v${e.version}${stale ? " — STALE (DB is v" + fresh + ")" : " (fresh)"}.`);
    }
  }

  function update() {
    const next = dbVersion + 1;
    setDbVersion(next);
    const writer = Math.floor(Math.random() * POD_COUNT);

    if (topology === "distributed") {
      if (invalidation === "none") {
        setLog(`Pod ${writer} writes v${next} to DB. Redis still holds the old value — all pods read stale until it expires or is cleared.`);
      } else {
        setShared(null);
        setLog(`Pod ${writer} writes v${next} to DB and clears Redis. Next read repopulates — every pod is consistent.`);
      }
      return;
    }

    // local topology
    if (invalidation === "broadcast") {
      setLocal(Array(POD_COUNT).fill(null));
      setLog(`Pod ${writer} writes v${next} and broadcasts an invalidation. All ${POD_COUNT} pods clear their local caches.`);
    } else if (invalidation === "on-write") {
      setLocal((prev) => prev.map((x, i) => (i === writer ? null : x)));
      setLog(`Pod ${writer} writes v${next} and clears ITS OWN cache. The other pods don't know — they keep serving stale data.`);
    } else if (invalidation === "ttl") {
      setLog(`Pod ${writer} writes v${next}. Local caches stay stale until their TTL expires.`);
    } else {
      setLog(`Pod ${writer} writes v${next} to DB. Nothing invalidates the local caches — they're all stale now.`);
    }
  }

  function reset() {
    setDbVersion(1);
    setLocal(Array(POD_COUNT).fill(null));
    setShared(null);
    setStats({ reads: 0, hits: 0, misses: 0, stale: 0 });
    setLog("Read or update the key to begin.");
  }

  function staleness(e: Entry): "empty" | "fresh" | "stale" {
    if (e === null) return "empty";
    return e.version < dbVersion ? "stale" : "fresh";
  }

  const staleNow =
    topology === "distributed"
      ? staleness(shared) === "stale"
        ? 1
        : 0
      : local.filter((e) => staleness(e) === "stale").length;

  return (
    <div className="flex flex-col gap-8">
      <Note>
        This is the question every team hits once it runs more than one copy of
        a service: <strong>where does the cache live?</strong> Give each pod its
        own <strong>local</strong> cache and reads are blazing fast — until a
        write on one pod leaves the others serving stale data. Put everything in
        one <strong>distributed</strong> cache (Redis) and they all agree, at
        the cost of a network hop. Update the key and watch which pods go stale.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
          <Segmented<Topology>
            label="cache topology"
            value={topology}
            onChange={(t) => {
              setTopology(t);
              reset();
            }}
            options={[
              { value: "local", label: "Local (per-pod)" },
              { value: "distributed", label: "Distributed (Redis)" },
            ]}
          />
          <Segmented<Invalidation>
            label="invalidation policy"
            value={invalidation}
            onChange={(v) => {
              setInvalidation(v);
              reset();
            }}
            options={[
              { value: "none", label: "None" },
              { value: "ttl", label: "TTL" },
              { value: "on-write", label: "On write" },
              { value: "broadcast", label: "Pub/sub" },
            ]}
          />
        </div>
        <p className="border-t border-[var(--hairline)] pt-4 text-[14px] leading-[1.6] text-[var(--slate)]">
          {INV_NOTE[invalidation]}
          {topology === "distributed" && invalidation === "broadcast" && (
            <span> With one shared cache there&apos;s nothing to broadcast to — clearing Redis already updates everyone.</span>
          )}
        </p>
      </Panel>

      {/* Diagram */}
      <Panel tone="ink" className="p-6 sm:p-8">
        {/* Pods */}
        <p className="mono-label mb-3 text-white/45">application pods</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${POD_COUNT}, minmax(0,1fr))` }}>
          {Array.from({ length: POD_COUNT }).map((_, i) => {
            const e = topology === "local" ? local[i] : shared;
            const st = staleness(e);
            const ttlLeft =
              invalidation === "ttl" && e?.expiresAt ? Math.max(0, Math.ceil((e.expiresAt - Date.now()) / 1000)) : null;
            return (
              <div key={i} className="flex flex-col rounded-[12px] border border-white/12 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between">
                  <span className="heading text-[15px] text-white">pod {i}</span>
                  <button
                    onClick={() => read(i)}
                    className="rounded-[7px] bg-white/10 px-2.5 py-1 font-mono text-[11px] text-white transition-colors hover:bg-white/20"
                  >
                    read →
                  </button>
                </div>
                {/* local cache box (only meaningful in local mode) */}
                {topology === "local" ? (
                  <div
                    className="mt-3 rounded-[8px] px-3 py-2.5 text-center font-mono text-[12px] transition-colors"
                    style={{
                      background: st === "empty" ? "rgba(255,255,255,0.05)" : st === "stale" ? "rgba(255,119,89,0.18)" : "rgba(80,227,194,0.16)",
                      color: st === "empty" ? "rgba(255,255,255,0.35)" : st === "stale" ? "#ffb6a3" : "#7ef0d8",
                    }}
                  >
                    {st === "empty" ? "empty" : `cached v${e!.version}`}
                    {st === "stale" && <span className="ml-1 font-bold">· STALE</span>}
                    {ttlLeft !== null && st !== "empty" && <span className="ml-1 text-white/40">({ttlLeft}s)</span>}
                  </div>
                ) : (
                  <div className="mt-3 rounded-[8px] border border-dashed border-white/15 px-3 py-2.5 text-center font-mono text-[11px] text-white/30">
                    no local cache
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Shared Redis (distributed only) */}
        {topology === "distributed" && (
          <>
            <div className="my-4 flex justify-center">
              <span className="font-mono text-[11px] text-white/30">↕ all pods share ↕</span>
            </div>
            {(() => {
              const st = staleness(shared);
              const ttlLeft =
                invalidation === "ttl" && shared?.expiresAt ? Math.max(0, Math.ceil((shared.expiresAt - Date.now()) / 1000)) : null;
              return (
                <div
                  className="mx-auto max-w-sm rounded-[12px] border px-4 py-4 text-center transition-colors"
                  style={{
                    borderColor: st === "stale" ? "var(--coral)" : "rgba(255,255,255,0.15)",
                    background: st === "empty" ? "rgba(255,255,255,0.04)" : st === "stale" ? "rgba(255,119,89,0.14)" : "rgba(80,227,194,0.12)",
                  }}
                >
                  <p className="heading text-[16px] text-white">Redis · shared cache</p>
                  <p className="mt-1 font-mono text-[12px]" style={{ color: st === "stale" ? "#ffb6a3" : "#7ef0d8" }}>
                    {st === "empty" ? "empty" : `cached v${shared!.version}`}
                    {st === "stale" && " · STALE"}
                    {ttlLeft !== null && st !== "empty" && ` (${ttlLeft}s)`}
                  </p>
                </div>
              );
            })()}
          </>
        )}

        {/* DB — the source of truth */}
        <div className="my-4 flex justify-center">
          <span className="font-mono text-[11px] text-white/30">↓ source of truth ↓</span>
        </div>
        <div className="mx-auto max-w-sm rounded-[12px] bg-white/[0.08] px-4 py-4 text-center">
          <p className="heading text-[16px] text-white">Database</p>
          <p className="mt-1 font-mono text-[13px] text-[#7ef0d8]">key = v{dbVersion}</p>
        </div>

        {/* Action log */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
          <ActionButton onClick={update}>Update key (write)</ActionButton>
          <ActionButton variant="ghost" onClick={reset}>Reset</ActionButton>
          <p className="flex-1 font-mono text-[12px] leading-relaxed text-white/55">{log}</p>
        </div>
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <Metric label="reads" value={`${stats.reads}`} />
        <Metric label="hits" value={`${stats.hits}`} />
        <Metric label="misses" value={`${stats.misses}`} />
        <Metric label="stale reads served" value={`${stats.stale}`} accent={stats.stale > 0} />
        <Metric label="pods stale now" value={`${staleNow}`} accent={staleNow > 0} />
      </Panel>

      <Note>
        The trade-off in one experiment: set <strong>Local</strong> +{" "}
        <strong>On write</strong>, prime all three pods with a read, then update
        the key. Only the writing pod clears — the other two keep serving the
        old value. That&apos;s cache <em>incoherence</em>, and it&apos;s the
        single most common caching bug in a horizontally-scaled service. The
        fixes you can try here: a short <strong>TTL</strong> (simple, eventually
        consistent), <strong>pub/sub</strong> invalidation (local speed,
        coordinated), or a <strong>distributed</strong> cache (one source of
        truth, one network hop). For per-strategy mechanics — cache-aside,
        write-through, and friends — see the{" "}
        <a className="link" href="/lab/caching-strategies">caching strategies</a>{" "}
        explainer.
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
