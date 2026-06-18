"use client";

import { useState } from "react";
import { ActionButton, Note, Panel } from "@/components/lab/ui";

type Arch = {
  cdn?: boolean;
  lb?: boolean;
  appCount: number;
  cache?: boolean;
  queue?: boolean;
  services?: boolean;
  replicas: number;
};

type Stage = {
  title: string;
  users: string;
  fixes: string;
  adds: string;
  arch: Arch;
  newKeys: string[]; // which component keys are new this stage
};

const STAGES: Stage[] = [
  {
    title: "Single server",
    users: "hundreds",
    fixes: "Nothing yet — you just need to ship. One box runs the app and the database together.",
    adds: "One VM. App + DB co-located. Simple, cheap, and perfectly fine to start.",
    arch: { appCount: 1, replicas: 0 },
    newKeys: ["app0", "db"],
  },
  {
    title: "Separate database",
    users: "thousands",
    fixes: "The app and database were fighting for the same CPU and memory. A heavy query would freeze the whole site.",
    adds: "Move the database onto its own machine so each can be sized and scaled independently.",
    arch: { appCount: 1, replicas: 0 },
    newKeys: ["db"],
  },
  {
    title: "Load balancer + app tier",
    users: "tens of thousands",
    fixes: "A single app server maxed out its CPU at peak. There was no headroom and no redundancy.",
    adds: "Make the app stateless and run several copies behind a load balancer. Scale out, not up — and survive a node dying.",
    arch: { lb: true, appCount: 3, replicas: 0 },
    newKeys: ["lb", "app1", "app2"],
  },
  {
    title: "Caching + CDN",
    users: "hundreds of thousands",
    fixes: "The same database reads ran over and over, and every image was served from your origin.",
    adds: "Put a cache in front of the database for hot data, and a CDN at the edge for static assets.",
    arch: { cdn: true, lb: true, appCount: 3, cache: true, replicas: 0 },
    newKeys: ["cdn", "cache"],
  },
  {
    title: "Read replicas",
    users: "millions",
    fixes: "Reads vastly outnumbered writes, but they all hit one database. The primary became the bottleneck.",
    adds: "Add read replicas. Writes go to the primary; reads fan out across replicas.",
    arch: { cdn: true, lb: true, appCount: 4, cache: true, replicas: 2 },
    newKeys: ["replica0", "replica1"],
  },
  {
    title: "Queues + services + sharding",
    users: "tens of millions",
    fixes: "Write throughput hit the ceiling of one primary, and a single codebase couldn't be shipped fast enough by many teams.",
    adds: "Shard the data, split the monolith into services, and move slow work onto async queues.",
    arch: { cdn: true, lb: true, appCount: 4, cache: true, queue: true, services: true, replicas: 2 },
    newKeys: ["queue", "services", "db", "replica0", "replica1"],
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
  tone?: "plain" | "ink" | "mint" | "coral";
  small?: boolean;
}) {
  const tones: Record<string, string> = {
    plain: "bg-white text-[var(--ink)] border-[var(--hairline)]",
    ink: "bg-[var(--near-black)] text-white border-transparent",
    mint: "bg-[var(--green-wash)] text-[var(--green)] border-[var(--green-wash)]",
    coral: "bg-[#fff5f2] text-[#c2412a] border-[var(--coral-soft)]",
  };
  return (
    <div
      className={`relative rounded-[10px] border text-center font-medium transition-all ${tones[tone]} ${
        small ? "px-3 py-2 text-[12px]" : "px-4 py-3 text-[13px]"
      } ${isNew ? "lab-pop ring-2 ring-[var(--coral)]" : ""}`}
    >
      {label}
      {isNew && (
        <span className="absolute -right-1.5 -top-2 rounded-full bg-[var(--coral)] px-1.5 py-0.5 font-mono text-[8px] uppercase text-white">
          new
        </span>
      )}
    </div>
  );
}

function Tier({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-20 shrink-0 text-right font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
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
        No one designs a system for millions of users on day one — and they
        shouldn&apos;t. Architecture <strong>evolves</strong>, one bottleneck at
        a time. Step through the stages and watch each new piece appear exactly
        when the previous design runs out of room.
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
                idx === i ? "w-7 bg-[var(--coral)]" : "w-2 bg-[var(--hairline)] hover:bg-[var(--slate)]"
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
          <span className="mono-label mr-3 text-[var(--coral)]">
            0{i + 1}
          </span>
          {stage.title}
        </h2>
        <span className="mono-label text-[var(--slate)]">~{stage.users} of users</span>
      </div>

      {/* Diagram */}
      <Panel tone="stone" className="flex flex-col gap-4 p-6 sm:p-8">
        <Tier label="Clients">
          <Box label="Users" tone="ink" />
        </Tier>

        {(a.cdn || a.lb) && (
          <Tier label="Edge">
            {a.cdn && <Box label="CDN" isNew={isNew("cdn")} tone="mint" />}
            {a.lb && <Box label="Load balancer" isNew={isNew("lb")} />}
          </Tier>
        )}

        <Tier label={a.services ? "Services" : "App"}>
          {a.services ? (
            <>
              <Box label="API gateway" isNew={isNew("services")} />
              <Box label="auth-svc" isNew={isNew("services")} small />
              <Box label="orders-svc" isNew={isNew("services")} small />
              <Box label="search-svc" isNew={isNew("services")} small />
            </>
          ) : (
            Array.from({ length: a.appCount }).map((_, idx) => (
              <Box key={idx} label={`app ${idx + 1}`} isNew={isNew(`app${idx}`)} />
            ))
          )}
        </Tier>

        {(a.cache || a.queue) && (
          <Tier label="Middle">
            {a.cache && <Box label="Cache" isNew={isNew("cache")} tone="mint" />}
            {a.queue && <Box label="Message queue" isNew={isNew("queue")} tone="coral" />}
          </Tier>
        )}

        <Tier label="Data">
          <Box label={a.services ? "Sharded primary" : "Database"} isNew={isNew("db")} tone="ink" />
          {Array.from({ length: a.replicas }).map((_, idx) => (
            <Box key={idx} label={`read replica ${idx + 1}`} isNew={isNew(`replica${idx}`)} small />
          ))}
        </Tier>
      </Panel>

      {/* Explanation */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Panel className="p-6">
          <p className="mono-label text-[#c2412a]">// the bottleneck</p>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink)]">{stage.fixes}</p>
        </Panel>
        <Panel className="p-6">
          <p className="mono-label text-[var(--green)]">// what we added</p>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink)]">{stage.adds}</p>
        </Panel>
      </div>

      <Note>
        Every arrow on this diagram was added to relieve real pressure, and
        each one brought new complexity: cache invalidation, replication lag,
        eventual consistency, distributed tracing. The art of system design
        isn&apos;t reaching the last stage — it&apos;s knowing which stage
        you&apos;re actually at, and not paying for the next one early.
      </Note>
    </div>
  );
}
