"use client";

import { useState } from "react";
import { Note, Panel, Slider, Stat } from "@/components/lab/ui";

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
    </div>
  );
}
