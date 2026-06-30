"use client";

import { useState } from "react";
import { ActionButton, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

type Mode = "local" | "distributed";

// The cached payload is just a version number - "the value of key user:42".
// dbVersion is the source of truth; a cached copy is FRESH if it matches it,
// STALE if it lags behind.
export default function DistributedCaching() {
  const [mode, setMode] = useState<Mode>("local");
  const [pods, setPods] = useState(3);
  const [dbVersion, setDbVersion] = useState(1);
  const [local, setLocal] = useState<(number | null)[]>(() =>
    Array(3).fill(null)
  );
  const [shared, setShared] = useState<number | null>(null);
  const [msg, setMsg] = useState<string>(
    "Read from a pod to populate its cache, then update the database and watch what happens."
  );
  const [flash, setFlash] = useState<{ pod: number; kind: "read" | "inval" } | null>(
    null
  );

  function resetCaches(n = pods) {
    setLocal(Array(n).fill(null));
    setShared(null);
  }

  function setPodCount(n: number) {
    setPods(n);
    setLocal((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? null));
  }

  function switchMode(m: Mode) {
    setMode(m);
    resetCaches();
    setMsg(
      m === "local"
        ? "Local mode: each pod has its own in-memory cache. They don't know about each other."
        : "Distributed mode: every pod reads and writes one shared cache (Redis)."
    );
  }

  function pop(pod: number, kind: "read" | "inval") {
    setFlash({ pod, kind });
    setTimeout(() => setFlash(null), 320);
  }

  function updateDb() {
    const next = dbVersion + 1;
    setDbVersion(next);
    setMsg(
      `Database updated to v${next} (e.g. the user changed their name). No cache was touched - every cached copy is now STALE until invalidated.`
    );
  }

  function readPod(i: number) {
    pop(i, "read");
    if (mode === "local") {
      setLocal((prev) => {
        const next = [...prev];
        if (next[i] == null) {
          next[i] = dbVersion;
          setMsg(`Pod ${i + 1}: MISS → loaded v${dbVersion} from the DB into its local cache.`);
        } else if (next[i] !== dbVersion) {
          setMsg(`Pod ${i + 1}: HIT → served STALE v${next[i]} (DB is on v${dbVersion}). It has no idea the data changed.`);
        } else {
          setMsg(`Pod ${i + 1}: HIT → served fresh v${next[i]}.`);
        }
        return next;
      });
    } else {
      if (shared == null) {
        setShared(dbVersion);
        setMsg(`Pod ${i + 1}: shared cache MISS → loaded v${dbVersion} into Redis for everyone.`);
      } else if (shared !== dbVersion) {
        setMsg(`Pod ${i + 1}: shared HIT → served STALE v${shared} (DB is on v${dbVersion}). Redis still needs invalidating.`);
      } else {
        setMsg(`Pod ${i + 1}: shared HIT → served fresh v${shared} from Redis.`);
      }
    }
  }

  function invalidate(i: number) {
    pop(i, "inval");
    if (mode === "local") {
      setLocal((prev) => {
        const next = [...prev];
        next[i] = null;
        return next;
      });
      setMsg(`Cleared pod ${i + 1}'s cache only. The other pods still hold their own copies - to fix them all you'd have to broadcast the invalidation to every pod.`);
    } else {
      setShared(null);
      setMsg(`Cleared the one shared entry in Redis. Every pod is now consistent on its next read - a single invalidation did it.`);
    }
  }

  // Coherence summary
  const staleCount =
    mode === "local"
      ? local.filter((v) => v != null && v !== dbVersion).length
      : shared != null && shared !== dbVersion
        ? 1
        : 0;
  const cachedCount =
    mode === "local" ? local.filter((v) => v != null).length : shared != null ? 1 : 0;
  const consistent = staleCount === 0;

  function badge(v: number | null) {
    if (v == null)
      return { label: "empty", cls: "border-[var(--hairline-light)] bg-white text-[var(--stone-text)]" };
    if (v !== dbVersion)
      return {
        label: `v${v} · stale`,
        cls: "border-[var(--accent-danger)] bg-[#fdeced] text-[var(--accent-danger)]",
      };
    return {
      label: `v${v} · fresh`,
      cls: "border-[var(--accent-teal)] bg-[rgba(0,168,126,0.08)] text-[var(--accent-teal)]",
    };
  }

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Run several copies of your app (<strong>pods</strong>) and each one can
        keep a cache in its own memory - blazing fast, no network hop. The catch:
        every pod has its <em>own</em> copy, so when the data changes they drift
        out of sync. A <strong>distributed cache</strong> (Redis) trades a little
        latency for one shared source the whole fleet agrees on. Update the DB
        and see the difference.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <Segmented<Mode>
          label="cache topology"
          value={mode}
          onChange={switchMode}
          options={[
            { value: "local", label: "Local (per-pod)" },
            { value: "distributed", label: "Distributed (Redis)" },
          ]}
        />
        <div className="w-full max-w-[200px]">
          <Slider label="app pods" min={2} max={5} value={pods} onChange={setPodCount} />
        </div>
        <div className="flex gap-2">
          <ActionButton onClick={updateDb}>Update DB value</ActionButton>
          <ActionButton variant="ghost" onClick={() => resetCaches()}>
            Reset
          </ActionButton>
        </div>
      </Panel>

      {/* Source of truth */}
      <Panel tone="stone" className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-[var(--near-black)] font-mono text-[12px] text-white">
            DB
          </span>
          <div>
            <p className="mono-label text-[var(--mute)]">source of truth · key user:42</p>
            <p className="font-mono text-[14px] text-[var(--ink)]">
              current value ={" "}
              <span className="font-medium text-[var(--ink)]">v{dbVersion}</span>
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 font-mono text-[11px] ${
            consistent
              ? "bg-[rgba(0,168,126,0.1)] text-[var(--accent-teal)]"
              : "bg-[#fdeced] text-[var(--accent-danger)]"
          }`}
        >
          {consistent
            ? "all caches consistent"
            : `${staleCount} serving stale data`}
        </span>
      </Panel>

      {/* Topology stage */}
      <Panel tone="stone" className="p-6 sm:p-8">
        {mode === "distributed" && (
          <div className="mb-6 flex flex-col items-center">
            <div
              className={`flex items-center gap-3 rounded-[12px] border bg-white px-5 py-3 transition-all ${
                shared == null
                  ? "border-[var(--hairline-light)]"
                  : shared !== dbVersion
                    ? "border-[var(--accent-danger)]"
                    : "border-[var(--accent-teal)]"
              }`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-[4px] bg-[var(--primary)] font-mono text-[11px] font-semibold text-white">
                R
              </span>
              <div>
                <p className="mono-label text-[var(--mute)]">shared cache · redis</p>
                <p className="font-mono text-[13px] text-[var(--ink)]">
                  {shared == null ? "empty" : `holds v${shared}`}
                  {shared != null && shared !== dbVersion && (
                    <span className="text-[var(--accent-danger)]"> · stale</span>
                  )}
                </p>
              </div>
            </div>
            <div className="mt-2 h-5 w-px bg-[var(--hairline-light)]" />
          </div>
        )}

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${pods}, minmax(0,1fr))` }}
        >
          {Array.from({ length: pods }).map((_, i) => {
            const value = mode === "local" ? local[i] : shared;
            const b = badge(value);
            const isFlash = flash?.pod === i;
            return (
              <div
                key={i}
                className={`flex flex-col rounded-[12px] border bg-white p-4 transition-all ${
                  isFlash
                    ? flash?.kind === "read"
                      ? "ring-2 ring-[var(--primary)]"
                      : "ring-2 ring-[var(--accent-danger)]"
                    : "border-[var(--hairline-light)]"
                }`}
                style={{ borderColor: isFlash ? "transparent" : undefined }}
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-[var(--surface-soft)] font-mono text-[11px] text-[var(--charcoal)]">
                    {i + 1}
                  </span>
                  <span className="font-mono text-[12px] text-[var(--charcoal)]">
                    pod {i + 1}
                  </span>
                </div>

                <div
                  className={`mt-3 rounded-[8px] border px-2 py-2 text-center font-mono text-[12px] ${b.cls}`}
                >
                  {mode === "distributed" ? (
                    <span className="text-[var(--stone-text)]">→ redis</span>
                  ) : (
                    b.label
                  )}
                </div>

                <div className="mt-3 flex gap-1.5">
                  <button
                    onClick={() => readPod(i)}
                    className="flex-1 rounded-[8px] bg-[var(--near-black)] py-1.5 font-mono text-[11px] text-white transition-opacity hover:opacity-85"
                  >
                    read
                  </button>
                  <button
                    onClick={() => invalidate(i)}
                    className="flex-1 rounded-[8px] border border-[var(--hairline-strong)] py-1.5 font-mono text-[11px] text-[var(--ink)] transition-colors hover:bg-[var(--surface-soft)]"
                  >
                    invalidate
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live narration */}
        <div className="mt-6 border-t border-[var(--hairline-light)] pt-4">
          <p className="font-mono text-[12px] leading-relaxed text-[var(--body)]">
            {msg}
          </p>
        </div>
      </Panel>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <div>
          <p className="mono-label text-[var(--mute)]">topology</p>
          <p className="display mt-1 text-[20px] text-[var(--ink)]">
            {mode === "local" ? "Per-pod" : "Shared / Redis"}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">cached copies</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">{cachedCount}</p>
        </div>
        <div>
          <p className="mono-label text-[var(--mute)]">stale copies</p>
          <p
            className="display mt-1 text-[24px]"
            style={{ color: staleCount ? "var(--accent-danger)" : "var(--ink)" }}
          >
            {staleCount}
          </p>
        </div>
      </Panel>

      <Note>
        The lesson for the team: <strong>local caches are fastest but can&apos;t
        be trusted to agree</strong> - invalidating one pod leaves the others
        stale, so you need a broadcast (and hope no pod misses it), or a short
        TTL so staleness self-heals. A <strong>distributed cache centralises the
        truth</strong>: one invalidation fixes everyone, at the cost of a network
        hop and a shared dependency you must keep highly available. Most real
        systems layer both - a tiny local cache in front of Redis - and accept a
        bounded window of staleness on purpose.
      </Note>
    </div>
  );
}
