"use client";

import { useState } from "react";
import { Note, Panel, Slider, Stat } from "@/components/lab/ui";
import {
  ChipIcon,
  MemoryIcon,
  StorageIcon,
  NetworkIcon,
} from "@/components/icons";

// "Latency numbers every engineer should know" (after Jeff Dean / Colin Scott).
type Cat = "cpu" | "memory" | "storage" | "network";

const CAT_META: Record<Cat, { label: string; color: string; Icon: typeof ChipIcon }> = {
  cpu: { label: "CPU / cache", color: "var(--charcoal)", Icon: ChipIcon },
  memory: { label: "Memory", color: "var(--primary)", Icon: MemoryIcon },
  storage: { label: "Storage", color: "var(--accent-warning)", Icon: StorageIcon },
  network: { label: "Network", color: "var(--accent-teal)", Icon: NetworkIcon },
};

const LATENCIES: { label: string; ns: number; cat: Cat }[] = [
  { label: "L1 cache reference", ns: 1, cat: "cpu" },
  { label: "Branch mispredict", ns: 3, cat: "cpu" },
  { label: "L2 cache reference", ns: 4, cat: "cpu" },
  { label: "Mutex lock / unlock", ns: 17, cat: "cpu" },
  { label: "Main memory reference", ns: 100, cat: "memory" },
  { label: "Compress 1 KB (Snappy)", ns: 2_000, cat: "cpu" },
  { label: "Send 1 KB over 1 Gbps network", ns: 10_000, cat: "network" },
  { label: "SSD random read", ns: 16_000, cat: "storage" },
  { label: "Read 1 MB sequentially from memory", ns: 250_000, cat: "memory" },
  { label: "Round trip within same datacenter", ns: 500_000, cat: "network" },
  { label: "Read 1 MB sequentially from SSD", ns: 1_000_000, cat: "storage" },
  { label: "Disk seek", ns: 10_000_000, cat: "storage" },
  { label: "Read 1 MB sequentially from disk", ns: 20_000_000, cat: "storage" },
  { label: "Round trip CA ↔ Netherlands", ns: 150_000_000, cat: "network" },
];

function fmtNs(ns: number): string {
  if (ns < 1_000) return `${ns} ns`;
  if (ns < 1_000_000) return `${+(ns / 1_000).toFixed(ns < 10_000 ? 1 : 0)} µs`;
  return `${+(ns / 1_000_000).toFixed(ns < 10_000_000 ? 1 : 0)} ms`;
}

const LAT_MIN = Math.log10(1);
const LAT_MAX = Math.log10(150_000_000);
const logWidth = (ns: number) =>
  ((Math.log10(ns) - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;

// log-scale slider over DAU so a single drag spans 1k → 100M.
const DAU_MIN_EXP = 3; // 1,000
const DAU_MAX_EXP = 8; // 100,000,000

function human(n: number): string {
  if (n < 1e3) return Math.round(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(n < 1e4 ? 1 : 0).replace(/\.0$/, "") + "K";
  if (n < 1e9) return (n / 1e6).toFixed(n < 1e7 ? 1 : 0).replace(/\.0$/, "") + "M";
  if (n < 1e12) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  return (n / 1e12).toFixed(1) + "T";
}

function bytes(n: number): string {
  const u = ["B", "KB", "MB", "GB", "TB", "PB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${u[i]}`;
}

export default function SystemMath() {
  const [exp, setExp] = useState(5); // 100k DAU
  const [reqPerUser, setReqPerUser] = useState(20);
  const [peakFactor, setPeakFactor] = useState(4);
  const [payloadKb, setPayloadKb] = useState(2);
  const [writeRatio, setWriteRatio] = useState(10); // % of requests that write

  const dau = Math.round(Math.pow(10, exp));
  const reqPerDay = dau * reqPerUser;
  const avgRps = reqPerDay / 86400;
  const peakRps = avgRps * peakFactor;

  // ~500 req/s per app server as a teaching constant
  const RPS_PER_SERVER = 500;
  const servers = Math.max(1, Math.ceil(peakRps / RPS_PER_SERVER));

  // storage: writes/day * payload, accumulated per year
  const writesPerDay = reqPerDay * (writeRatio / 100);
  const storagePerDay = writesPerDay * payloadKb * 1024;
  const storagePerYear = storagePerDay * 365;

  // bandwidth: all reads served at payload size
  const egressPerDay = reqPerDay * payloadKb * 1024;

  // toy monthly cost: $40/server + $0.02/GB-month storage + $0.08/GB egress
  const storageGbYear = storagePerYear / 1024 ** 3;
  const egressGbMonth = (egressPerDay * 30) / 1024 ** 3;
  const monthlyCost =
    servers * 40 + storageGbYear * 0.02 + egressGbMonth * 0.08;

  const cascade = [
    { label: "Requests / day", value: human(reqPerDay), sub: `${reqPerUser} per user` },
    { label: "Average RPS", value: human(avgRps), sub: "spread over 24h" },
    { label: "Peak RPS", value: human(peakRps), accent: true, sub: `${peakFactor}× average` },
    { label: "App servers", value: human(servers), sub: `@ ${RPS_PER_SERVER} rps each` },
    { label: "Writes / day", value: human(writesPerDay), sub: `${writeRatio}% of traffic` },
    { label: "New storage / yr", value: bytes(storagePerYear), sub: `${payloadKb} KB/item` },
    { label: "Egress / day", value: bytes(egressPerDay), sub: "read bandwidth" },
    { label: "Est. cost / mo", value: "$" + human(monthlyCost), accent: true, sub: "rough order" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Capacity estimation — &ldquo;back-of-the-envelope math&rdquo; — is the
        first thing asked in a system design interview. You start from one
        number, <strong>daily active users</strong>, and multiply your way out
        to servers, storage, and cost. Drag the inputs and watch every
        downstream number recompute.
      </Note>

      {/* Inputs */}
      <Panel className="grid gap-6 p-6 sm:grid-cols-2">
        <Slider
          label="daily active users"
          min={DAU_MIN_EXP}
          max={DAU_MAX_EXP}
          step={0.01}
          value={exp}
          onChange={setExp}
          display={human(dau)}
        />
        <Slider
          label="requests / user / day"
          min={1}
          max={200}
          value={reqPerUser}
          onChange={setReqPerUser}
          display={`${reqPerUser}`}
        />
        <Slider
          label="peak factor"
          min={1}
          max={10}
          value={peakFactor}
          onChange={setPeakFactor}
          display={`${peakFactor}×`}
        />
        <Slider
          label="avg payload size"
          min={1}
          max={500}
          value={payloadKb}
          onChange={setPayloadKb}
          display={`${payloadKb} KB`}
        />
        <Slider
          label="write ratio"
          min={0}
          max={100}
          value={writeRatio}
          onChange={setWriteRatio}
          display={`${writeRatio}%`}
        />
      </Panel>

      {/* Cascade */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
        {cascade.map((c) => (
          <Stat key={c.label} label={c.label} value={c.value} sub={c.sub} accent={c.accent} />
        ))}
      </div>

      <Note>
        These are <em>order-of-magnitude</em> numbers, and that&apos;s the
        point. A staff engineer doesn&apos;t need the cost to the dollar — they
        need to know whether the answer is &ldquo;3 servers&rdquo; or
        &ldquo;3,000&rdquo;, because those are completely different
        architectures. Push DAU to 100M and watch a single-box design become
        an obviously distributed one.
      </Note>

      {/* Latency numbers every engineer should know */}
      <div className="mt-4">
        <p className="mono-label text-[var(--charcoal)]">// latency numbers every engineer should know</p>
        <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.55] text-[var(--mute)]">
          The other half of capacity math: how long operations actually take.
          The scale is logarithmic — each step right is roughly 10× slower — so
          you can feel why a cache hit, an SSD read and a transatlantic round
          trip live in completely different worlds.
        </p>

        {/* legend */}
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {(Object.keys(CAT_META) as Cat[]).map((c) => {
            const { label, color, Icon } = CAT_META[c];
            return (
              <span key={c} className="inline-flex items-center gap-1.5 text-[12px] text-[var(--mute)]">
                <Icon className="h-4 w-4" />
                <span style={{ color }}>{label}</span>
              </span>
            );
          })}
        </div>

        <Panel tone="stone" className="mt-5 divide-y divide-[var(--hairline-light)] p-2 sm:p-4">
          {LATENCIES.map((l) => {
            const { color, Icon } = CAT_META[l.cat];
            return (
              <div key={l.label} className="flex items-center gap-3 px-2 py-2.5 sm:gap-4">
                <span className="shrink-0" style={{ color }}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="w-[44%] shrink-0 truncate text-[13px] text-[var(--ink)] sm:w-[40%]">
                  {l.label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--hairline-light)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${Math.max(2, logWidth(l.ns))}%`, background: color }}
                  />
                </div>
                <span className="w-[64px] shrink-0 text-right font-mono text-[12px] text-[var(--charcoal)]">
                  {fmtNs(l.ns)}
                </span>
              </div>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}
