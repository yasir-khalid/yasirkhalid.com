"use client";

import { useState } from "react";
import { ActionButton, Note, Panel } from "@/components/lab/ui";

type Arch = {
  combined?: boolean; // app + cache + db on one box
  observability?: boolean;
  cdn?: boolean;
  lb?: boolean;
  appCount: number;
  cache?: boolean;
  queue?: boolean;
  workers?: boolean;
  replicas: number;
  shards?: boolean;
};

type Stage = {
  title: string;
  users: string;
  fixes: string; // the bottleneck this stage relieves
  adds: string; // what we add
  watch: string; // the new cost / trade-off
  arch: Arch;
  newKeys: string[];
};

const STAGES: Stage[] = [
  {
    title: "A single VM",
    users: "first users",
    fixes:
      "Nothing yet - the only goal is to ship. One box runs your web app, an in-process cache and the database, all together.",
    adds: "A single virtual machine. Cheap, simple, one thing to deploy and reason about. Perfectly fine to start.",
    watch:
      "One failure takes the whole site down, and the app and database fight over the same CPU, memory and disk.",
    arch: { combined: true, appCount: 1, replicas: 0 },
    newKeys: ["vm"],
  },
  {
    title: "Split the database off",
    users: "thousands",
    fixes:
      "The app and database were competing for the same machine - one heavy query could freeze the entire site.",
    adds: "Move the database onto its own box so each can be sized and tuned independently. The cheapest scaling is still vertical: give the DB more RAM and faster disks before anything cleverer.",
    watch:
      "Now there's a network hop and a connection pool to manage - and a single database is still a single point of failure.",
    arch: { appCount: 1, cache: true, replicas: 0 },
    newKeys: ["db"],
  },
  {
    title: "See what's actually happening",
    users: "thousands",
    fixes:
      "You're about to scale - but on a hunch. Which layer is actually slow: the app, the database, or the network between them?",
    adds: "Instrument everything before you scale: metrics (p50/p99 latency, throughput, error rate), structured logs, and distributed traces on a dashboard. Measure, don't guess.",
    watch:
      "Scaling the wrong layer wastes money and time. The real bottleneck is almost never where intuition says it is.",
    arch: { observability: true, appCount: 1, cache: true, replicas: 0 },
    newKeys: ["observability"],
  },
  {
    title: "More than one app server",
    users: "tens of thousands",
    fixes:
      "A single app server pinned its CPU at peak - no headroom, and no redundancy if it died.",
    adds: "Make the app stateless (push sessions into the cache or DB) and run several copies behind a load balancer. Scale out, not up - and survive a node failing.",
    watch:
      "State can no longer live inside the app process; deploys, sticky sessions and config drift all get trickier.",
    arch: { observability: true, lb: true, appCount: 3, cache: true, replicas: 0 },
    newKeys: ["lb", "app1", "app2"],
  },
  {
    title: "Cache and CDN",
    users: "hundreds of thousands",
    fixes:
      "The same database reads ran over and over, and every image and script was served straight from your origin.",
    adds: "Put a shared cache (Redis) in front of the database for hot data, and a CDN at the edge for static assets and media - close to users, off your servers.",
    watch:
      "Cache invalidation is now your problem: stale reads, and a thundering herd hammering the DB whenever the cache goes cold.",
    arch: { observability: true, cdn: true, lb: true, appCount: 3, cache: true, replicas: 0 },
    newKeys: ["cdn", "cache"],
  },
  {
    title: "Get slow work off the request path",
    users: "hundreds of thousands",
    fixes:
      "Slow work - sending email, processing images, generating exports - blocked the request and tied up app threads.",
    adds: "Drop slow or non-urgent work onto a message queue and let background workers process it. The request returns immediately; the work happens out of band.",
    watch:
      "You've traded synchronous simplicity for eventual consistency, retries, dead-letter queues and one more system to monitor.",
    arch: { observability: true, cdn: true, lb: true, appCount: 3, cache: true, queue: true, workers: true, replicas: 0 },
    newKeys: ["queue", "workers"],
  },
  {
    title: "Read replicas and sharding",
    users: "millions",
    fixes:
      "Reads vastly outnumbered writes but all hit one primary; later, even the writes outgrew a single primary.",
    adds: "Add read replicas and route reads to them. When writes themselves saturate the primary, shard the data across multiple primaries by key.",
    watch:
      "Replication lag means a read can be stale right after a write, and sharding kills cross-shard joins and transactions. This is where 'simple' ends.",
    arch: { observability: true, cdn: true, lb: true, appCount: 4, cache: true, queue: true, workers: true, shards: true, replicas: 2 },
    newKeys: ["shards", "replica0", "replica1"],
  },
];

function Box({
  label,
  isNew,
  tone = "plain",
  small,
}: {
  label: string;
  isNew?: boolean;
  tone?: "plain" | "ink" | "mint" | "cobalt" | "warn";
  small?: boolean;
}) {
  const tones: Record<string, string> = {
    plain: "bg-white text-[var(--ink)] border-[var(--hairline-light)]",
    ink: "bg-[var(--near-black)] text-white border-transparent",
    mint: "bg-[rgba(0,168,126,0.1)] text-[var(--accent-teal)] border-[rgba(0,168,126,0.3)]",
    cobalt: "bg-[rgba(73,79,223,0.1)] text-[var(--primary)] border-[rgba(73,79,223,0.3)]",
    warn: "bg-[rgba(236,126,0,0.1)] text-[var(--accent-warning)] border-[rgba(236,126,0,0.3)]",
  };
  return (
    <div
      className={`relative rounded-[10px] border text-center font-medium transition-all ${tones[tone]} ${
        small ? "px-3 py-2 text-[12px]" : "px-4 py-3 text-[13px]"
      } ${isNew ? "lab-pop ring-2 ring-[var(--primary)]" : ""}`}
    >
      {label}
      {isNew && (
        <span className="absolute -right-1.5 -top-2 rounded-full bg-[var(--primary)] px-1.5 py-0.5 font-mono text-[8px] uppercase text-white">
          new
        </span>
      )}
    </div>
  );
}

function Tier({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-right font-mono text-[10px] uppercase tracking-wide text-[var(--stone-text)]">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export default function SystemEvolution() {
  const [i, setI] = useState(0);
  const stage = STAGES[i];
  const a = stage.arch;
  const isNew = (k: string) => stage.newKeys.includes(k);

  return (
    <div className="flex flex-col gap-8">
      <Note>
        No one designs for millions of users on day one - and they shouldn&apos;t.
        Architecture <strong>evolves</strong>, one bottleneck at a time. Step
        through the stages and watch each new piece appear exactly when the
        previous design runs out of room - and what new problem it brings with it.
      </Note>

      {/* Stepper */}
      <div className="flex items-center justify-between gap-4">
        <ActionButton variant="ghost" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
          ← Back
        </ActionButton>
        <div className="flex flex-1 items-center justify-center gap-2">
          {STAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Stage ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-7 bg-[var(--primary)]" : "w-2 bg-[var(--hairline-light)] hover:bg-[var(--stone-text)]"
              }`}
            />
          ))}
        </div>
        <ActionButton onClick={() => setI((v) => Math.min(STAGES.length - 1, v + 1))} disabled={i === STAGES.length - 1}>
          Next →
        </ActionButton>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="heading text-[28px] text-[var(--ink)]">
          <span className="mono-label mr-3 text-[var(--primary)]">0{i + 1}</span>
          {stage.title}
        </h2>
        <span className="mono-label text-[var(--mute)]">~{stage.users}</span>
      </div>

      {/* Diagram */}
      <Panel tone="stone" className="flex flex-col gap-4 p-6 sm:p-8">
        {a.observability && (
          <div
            className={`flex items-center justify-between rounded-[10px] border px-4 py-2 transition-all ${
              isNew("observability")
                ? "lab-pop border-[var(--primary)] bg-[rgba(73,79,223,0.06)]"
                : "border-dashed border-[var(--hairline-light)] bg-white"
            }`}
          >
            <span className="font-mono text-[11px] text-[var(--charcoal)]">
              📊 observability · metrics · logs · traces
            </span>
            <span className="font-mono text-[10px] text-[var(--stone-text)]">p50 · p99 · errors · saturation</span>
          </div>
        )}

        <Tier label="Clients">
          <Box label="Users" tone="ink" />
        </Tier>

        {a.combined ? (
          <Tier label="Server">
            <Box label="1 VM · web app + cache + database" isNew={isNew("vm")} tone="cobalt" />
          </Tier>
        ) : (
          <>
            {(a.cdn || a.lb) && (
              <Tier label="Edge">
                {a.cdn && <Box label="CDN" isNew={isNew("cdn")} tone="mint" />}
                {a.lb && <Box label="Load balancer" isNew={isNew("lb")} />}
              </Tier>
            )}

            <Tier label="App">
              {Array.from({ length: a.appCount }).map((_, idx) => (
                <Box key={idx} label={`app ${idx + 1}`} isNew={isNew(`app${idx}`)} />
              ))}
            </Tier>

            {(a.queue || a.workers) && (
              <Tier label="Async">
                {a.queue && <Box label="Message queue" isNew={isNew("queue")} tone="warn" />}
                {a.workers && <Box label="Workers ×N" isNew={isNew("workers")} tone="warn" small />}
              </Tier>
            )}

            {a.cache && (
              <Tier label="Cache">
                <Box label="Redis (shared)" isNew={isNew("cache")} tone="mint" />
              </Tier>
            )}

            <Tier label="Data">
              {a.shards ? (
                <>
                  <Box label="shard 1 · primary" isNew={isNew("shards")} tone="ink" small />
                  <Box label="shard 2 · primary" isNew={isNew("shards")} tone="ink" small />
                  <Box label="shard 3 · primary" isNew={isNew("shards")} tone="ink" small />
                </>
              ) : (
                <Box label="Database" isNew={isNew("db")} tone="ink" />
              )}
              {Array.from({ length: a.replicas }).map((_, idx) => (
                <Box key={idx} label={`read replica ${idx + 1}`} isNew={isNew(`replica${idx}`)} small />
              ))}
            </Tier>
          </>
        )}
      </Panel>

      {/* Explanation - bottleneck / what we added / the trade-off */}
      <div className="grid gap-5 md:grid-cols-3">
        <Panel className="p-6">
          <p className="mono-label text-[var(--accent-danger)]">// the bottleneck</p>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink)]">{stage.fixes}</p>
        </Panel>
        <Panel className="p-6">
          <p className="mono-label text-[var(--accent-teal)]">// what we added</p>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink)]">{stage.adds}</p>
        </Panel>
        <Panel className="p-6">
          <p className="mono-label text-[var(--accent-warning)]">// the new trade-off</p>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink)]">{stage.watch}</p>
        </Panel>
      </div>

      <Note>
        Every box on this diagram was added to relieve real pressure, and each
        one brought new complexity: connection pools, cache invalidation,
        replication lag, eventual consistency, distributed tracing. The art of
        system design isn&apos;t reaching the last stage - it&apos;s knowing
        which stage you&apos;re actually at, and refusing to pay for the next one
        before you need it.
      </Note>
    </div>
  );
}
