"use client";

import { useState } from "react";
import { Note, Panel, Slider, Stat } from "@/components/lab/ui";
import {
  ChipIcon,
  MemoryIcon,
  StorageIcon,
  NetworkIcon,
} from "@/components/icons";

// =====================================================================
// "Napkin math" - turn DAU into infrastructure, one section at a time.
// Sliders propagate downstream. Mirrors arjaythedev.com/napkin-math.
// =====================================================================

const DAU_MIN_EXP = 3; // 1,000
const DAU_MAX_EXP = 9; // 1,000,000,000

// Teaching constants (rules of thumb)
const SECONDS_PER_DAY = 86_400;
const TARGET_UTIL = 0.7;

function human(n: number): string {
  if (n < 1e3) return Math.round(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(n < 1e4 ? 1 : 0).replace(/\.0$/, "") + "K";
  if (n < 1e9) return (n / 1e6).toFixed(n < 1e7 ? 1 : 0).replace(/\.0$/, "") + "M";
  if (n < 1e12) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  return (n / 1e12).toFixed(1) + "T";
}

function bytesFmt(n: number): string {
  const u = ["B", "KB", "MB", "GB", "TB", "PB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${u[i]}`;
}

// --- Latency numbers every engineer should know (after Jeff Dean / Colin Scott) ---
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
const logWidth = (ns: number) => ((Math.log10(ns) - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;

// --- Presets ---
type Preset = {
  name: string;
  exp: number;
  reqPerUser: number;
  peak: number;
  readShare: number;
  hitRate: number;
  objectKb: number;
  replication: number;
  retention: number;
};
const PRESETS: Preset[] = [
  { name: "URL shortener", exp: 7, reqPerUser: 10, peak: 3, readShare: 95, hitRate: 90, objectKb: 0.5, replication: 3, retention: 5 },
  { name: "Chat app", exp: 7.7, reqPerUser: 40, peak: 4, readShare: 60, hitRate: 50, objectKb: 1, replication: 3, retention: 2 },
  { name: "Photo feed", exp: 8, reqPerUser: 20, peak: 5, readShare: 85, hitRate: 70, objectKb: 600, replication: 3, retention: 5 },
];

// --- Small SVG donut for request distribution ---
function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const R = 58;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40">
      <g transform="rotate(-90 80 80)">
        <circle cx={80} cy={80} r={R} fill="none" stroke="var(--hairline-light)" strokeWidth={22} />
        {segments.map((s) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={s.label}
              cx={80}
              cy={80}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={22}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </g>
    </svg>
  );
}

// --- 24-hour daily traffic curve (a bell peaking mid-afternoon) ---
function TrafficCurve({ avg, peak }: { avg: number; peak: number }) {
  const W = 760;
  const H = 240;
  const padX = 10;
  const padT = 26;
  const padB = 26;
  const yMax = Math.max(peak * 1.15, 1);
  // req/s over the day: average, modulated to peak at ~14:00 and dip overnight
  const rps = (t: number) =>
    Math.max(0, avg + (peak - avg) * Math.cos(((t - 14) / 24) * 2 * Math.PI));
  const x = (t: number) => padX + (t / 24) * (W - 2 * padX);
  const y = (v: number) => padT + (1 - v / yMax) * (H - padT - padB);

  let line = "";
  for (let t = 0; t <= 24; t += 0.5) {
    line += `${t === 0 ? "M" : "L"}${x(t).toFixed(1)} ${y(rps(t)).toFixed(1)} `;
  }
  const area = `${line}L${x(24).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const yAvg = y(avg);
  const yPeak = y(peak);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily traffic curve">
      <path d={area} fill="rgba(73,79,223,0.08)" />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" />

      {/* peak line */}
      <line x1={padX} x2={W - padX} y1={yPeak} y2={yPeak} stroke="var(--accent-danger)" strokeWidth={1} strokeDasharray="4 4" />
      <text x={padX} y={yPeak - 6} className="font-mono" fontSize={11} fill="var(--accent-danger)">
        peak {human(peak)}/s
      </text>

      {/* avg line */}
      <line x1={padX} x2={W - padX} y1={yAvg} y2={yAvg} stroke="var(--accent-blue-link)" strokeWidth={1} strokeDasharray="4 4" />
      <text x={padX} y={yAvg - 6} className="font-mono" fontSize={11} fill="var(--accent-blue-link)">
        avg {human(avg)}/s
      </text>

      {/* hour axis */}
      {[0, 6, 12, 18, 24].map((h) => (
        <text key={h} x={x(h)} y={H - 8} textAnchor={h === 0 ? "start" : h === 24 ? "end" : "middle"} className="font-mono" fontSize={10} fill="var(--stone-text)">
          {h}h
        </text>
      ))}
    </svg>
  );
}

// Bordered metric card (the headline numbers in the reference layout)
function MetricCard({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "blue" | "red" }) {
  const c = tone === "blue" ? "var(--accent-blue-link)" : tone === "red" ? "var(--accent-danger)" : "var(--ink)";
  return (
    <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
      <p className="mono-label text-[10px] text-[var(--stone-text)]">{label}</p>
      <p className="display mt-2 text-[clamp(1.3rem,2.2vw,1.9rem)]" style={{ color: c }}>
        {value}
      </p>
    </div>
  );
}

export default function SystemMath() {
  const [exp, setExp] = useState(7); // 10M DAU
  const [reqPerUser, setReqPerUser] = useState(20);
  const [peak, setPeak] = useState(3);
  const [readShare, setReadShare] = useState(90);
  const [hitRate, setHitRate] = useState(80);
  const [objectKb, setObjectKb] = useState(2);
  const [appCap, setAppCap] = useState(1000);
  const [readsPerNode, setReadsPerNode] = useState(5000);
  const [writesPerNode, setWritesPerNode] = useState(2000);
  const [replication, setReplication] = useState(3);
  const [retention, setRetention] = useState(3);

  function applyPreset(p: Preset) {
    setExp(p.exp);
    setReqPerUser(p.reqPerUser);
    setPeak(p.peak);
    setReadShare(p.readShare);
    setHitRate(p.hitRate);
    setObjectKb(p.objectKb);
    setReplication(p.replication);
    setRetention(p.retention);
  }

  // ---- 02 · traffic ----
  const dau = Math.round(Math.pow(10, exp));
  const reqPerDay = dau * reqPerUser;
  const avgRps = reqPerDay / SECONDS_PER_DAY;
  const peakRps = avgRps * peak;

  // ---- 03 · fleet ----
  const fleetNeeded = Math.max(1, Math.ceil(peakRps / (appCap * TARGET_UTIL)));
  const fleetTotal = fleetNeeded + 1; // +1 spare for redundancy

  // ---- 04 · cache & read distribution ----
  const readsRps = peakRps * (readShare / 100);
  const writesRps = peakRps * (1 - readShare / 100);
  const cacheHitsRps = readsRps * (hitRate / 100);
  const dbReadsRps = readsRps * (1 - hitRate / 100);
  const dailyReads = reqPerDay * (readShare / 100);
  // 80/20: cache the ~20% of objects that serve ~80% of reads
  const cacheMemBytes = dailyReads * 0.2 * objectKb * 1024;

  // ---- 05 · database nodes ----
  const shards = Math.max(1, Math.ceil(writesRps / writesPerNode));
  const readReplicas = Math.max(1, Math.ceil(dbReadsRps / readsPerNode));
  const replicasPerShard = Math.max(1, Math.ceil(readReplicas / shards));
  const totalNodes = shards * replicasPerShard;

  // ---- 06 · storage & bandwidth ----
  const dailyWrites = reqPerDay * (1 - readShare / 100);
  const dailyWriteBytes = dailyWrites * objectKb * 1024 * replication;
  const annualBytes = dailyWriteBytes * 365;
  const fullRetentionBytes = annualBytes * retention;
  const peakReadsRps = peakRps * (readShare / 100);
  const egressMbps = (peakReadsRps * objectKb * 1024 * 8) / 1e6;
  const maxCumBytes = annualBytes * retention || 1;

  // Build a self-contained, printable HTML report and download it.
  function downloadReport() {
    const now = new Date();
    const stamp = now.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

    const sections: { n: string; title: string; rows: [string, string][] }[] = [
      {
        n: "01",
        title: "Inputs",
        rows: [
          ["Daily active users", human(dau)],
          ["Requests / user / day", `${reqPerUser}`],
          ["Peak multiplier", `${peak}×`],
          ["Read share", `${readShare}%`],
          ["Cache hit rate", `${hitRate}%`],
          ["Avg object size", `${objectKb} KB`],
          ["App server capacity", `${human(appCap)}/s`],
          ["DB reads / node", `${human(readsPerNode)}/s`],
          ["DB writes / node", `${human(writesPerNode)}/s`],
          ["Replication factor", `${replication}×`],
          ["Retention", `${retention} yr`],
        ],
      },
      {
        n: "02",
        title: "Traffic",
        rows: [
          ["Requests / day", human(reqPerDay)],
          ["Average RPS", `${human(avgRps)}/s`],
          ["Peak RPS", `${human(peakRps)}/s`],
        ],
      },
      {
        n: "03",
        title: "App server fleet",
        rows: [
          ["Servers needed", human(fleetNeeded)],
          ["Spare", "1"],
          ["Fleet total", `${human(fleetTotal)} @ ${TARGET_UTIL * 100}% util`],
        ],
      },
      {
        n: "04",
        title: "Cache & read distribution",
        rows: [
          ["Cache hits (absorbed)", `${human(cacheHitsRps)}/s`],
          ["Database reads", `${human(dbReadsRps)}/s`],
          ["Database writes", `${human(writesRps)}/s`],
          ["Cache memory (80/20)", bytesFmt(cacheMemBytes)],
        ],
      },
      {
        n: "05",
        title: "Database nodes",
        rows: [
          ["Shards", human(shards)],
          ["Replicas / shard", human(replicasPerShard)],
          ["Total nodes", human(totalNodes)],
        ],
      },
      {
        n: "06",
        title: "Storage & bandwidth",
        rows: [
          ["New data / day", bytesFmt(dailyWriteBytes)],
          ["Per year", bytesFmt(annualBytes)],
          [`At ${retention} yr retention`, bytesFmt(fullRetentionBytes)],
          ["Peak egress", `${human(egressMbps)} Mbps`],
        ],
      },
    ];

    const summary: [string, string][] = [
      ["DAU", human(dau)],
      ["Peak RPS", `${human(peakRps)}/s`],
      ["App servers", human(fleetTotal)],
      ["DB nodes", human(totalNodes)],
      ["Storage", bytesFmt(fullRetentionBytes)],
    ];

    const nav = sections
      .map((s) => `<a href="#s${s.n}"><span class="num">${s.n}</span>${s.title}</a>`)
      .join("");

    const summaryHtml = summary
      .map(([k, v]) => `<div class="kpi"><div class="kpi-l">${k}</div><div class="kpi-v">${v}</div></div>`)
      .join("");

    const body = sections
      .map(
        (s) => `
        <section id="s${s.n}">
          <h2><span class="snum">${s.n}</span>${s.title}</h2>
          <table>${s.rows
            .map(([k, v]) => `<tr><td class="k">${k}</td><td class="v">${v}</td></tr>`)
            .join("")}</table>
        </section>`
      )
      .join("");

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>System Design Estimate</title>
<style>
  :root{--ink:#191c1f;--mute:#505a63;--stone:#8d969e;--line:#e2e2e7;--soft:#f4f4f4;--primary:#494fdf;}
  *{box-sizing:border-box;}
  body{margin:0;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Inter",Segoe UI,Roboto,sans-serif;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased;}
  .wrap{display:flex;max-width:1100px;margin:0 auto;min-height:100vh;}
  aside{width:280px;flex:none;border-right:1px solid var(--line);padding:40px 28px;position:sticky;top:0;align-self:flex-start;height:100vh;}
  .brand{display:flex;align-items:center;gap:10px;}
  .glyph{width:28px;height:28px;border-radius:8px;background:var(--primary);color:#fff;display:grid;place-items:center;font-weight:600;font-size:12px;}
  .brand b{font-size:15px;letter-spacing:-.01em;}
  h1{font-size:22px;letter-spacing:-.02em;margin:28px 0 4px;}
  .sub{color:var(--mute);font-size:13px;margin:0 0 24px;}
  .kpis{display:flex;flex-direction:column;gap:10px;margin:0 0 28px;}
  .kpi{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:8px;}
  .kpi-l{color:var(--stone);font-size:12px;text-transform:uppercase;letter-spacing:.04em;font-family:ui-monospace,monospace;}
  .kpi-v{font-weight:600;}
  nav{display:flex;flex-direction:column;gap:2px;}
  nav a{display:flex;align-items:center;gap:10px;color:var(--mute);text-decoration:none;font-size:14px;padding:7px 0;border-bottom:1px solid var(--line);}
  nav a:hover{color:var(--primary);}
  nav .num{font-family:ui-monospace,monospace;font-size:11px;color:var(--stone);}
  main{flex:1;padding:40px 44px;}
  .toolbar{display:flex;justify-content:flex-end;margin-bottom:24px;}
  button.print{background:var(--ink);color:#fff;border:0;border-radius:999px;padding:10px 22px;font:600 14px/1 inherit;cursor:pointer;}
  section{margin:0 0 36px;}
  h2{font-size:18px;letter-spacing:-.01em;display:flex;align-items:baseline;gap:12px;margin:0 0 14px;padding-bottom:12px;border-bottom:1px solid var(--line);}
  .snum{font-family:ui-monospace,monospace;font-size:12px;color:var(--primary);}
  table{width:100%;border-collapse:collapse;}
  td{padding:9px 0;border-bottom:1px solid var(--soft);}
  td.k{color:var(--mute);}
  td.v{text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}
  .formula{background:var(--soft);border-radius:12px;padding:16px 18px;font-family:ui-monospace,monospace;font-size:13px;color:var(--mute);margin-bottom:28px;}
  .formula b{color:var(--ink);} .formula .a{color:#376cd5;} .formula .p{color:#e23b4a;}
  footer{color:var(--stone);font-size:12px;border-top:1px solid var(--line);padding-top:16px;margin-top:8px;}
  @media print{aside{position:static;height:auto;}.toolbar{display:none;}.wrap{display:block;}aside{width:auto;border-right:0;border-bottom:1px solid var(--line);}}
  @media(max-width:760px){.wrap{display:block;}aside{width:auto;height:auto;position:static;border-right:0;border-bottom:1px solid var(--line);}}
</style></head>
<body>
  <div class="wrap">
    <aside>
      <div class="brand"><span class="glyph">YK</span><b>System Design Estimate</b></div>
      <h1>Capacity report</h1>
      <p class="sub">${stamp}</p>
      <div class="kpis">${summaryHtml}</div>
      <nav>${nav}</nav>
    </aside>
    <main>
      <div class="toolbar"><button class="print" onclick="window.print()">Print / Save as PDF</button></div>
      <div class="formula">
        <b>${human(dau)}</b> DAU × <b>${reqPerUser}</b> req/user/day = <b>${human(reqPerDay)}</b> req/day ÷ 86,400 s =
        <b class="a">${human(avgRps)}</b> req/s avg ··· × <b>${peak}</b> peak = <b class="p">${human(peakRps)}</b> req/s peak
      </div>
      ${body}
      <footer>Generated with the interactive napkin-math tool at yasirkhalid.com/lab · order-of-magnitude estimates, not production figures.</footer>
    </main>
  </div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-design-estimate-${now.toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function SectionHeader({ n, title }: { n: string; title: string }) {
    return (
      <div className="flex items-baseline gap-3">
        <span className="mono-label text-[var(--primary)]">{n}</span>
        <h3 className="heading text-[19px] text-[var(--ink)]">{title}</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Note>
        Capacity estimation - &ldquo;napkin math&rdquo; - is the first move in
        any system design discussion. Start from one number,{" "}
        <strong>daily active users</strong>, and multiply your way out to
        servers, cache, database nodes, storage and bandwidth. Every slider
        below cascades into the ones beneath it.
      </Note>

      {/* Presets + report */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-label text-[var(--mute)]">presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="pill-outline transition-colors hover:border-[var(--ink)]"
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={downloadReport}
          className="btn btn-cobalt !min-h-0 !px-5 !py-2 !text-[14px] sm:ml-auto"
        >
          ↓ Download report
        </button>
      </div>

      {/* 02 · DAU → requests/second */}
      <section className="flex flex-col gap-5">
        <SectionHeader n="02" title="DAU → requests / second" />

        {/* running formula - say the numbers out loud */}
        <Panel className="p-4 sm:p-5">
          <p className="font-mono text-[12px] leading-relaxed text-[var(--charcoal)] sm:text-[13px]">
            <b className="text-[var(--ink)]">{human(dau)}</b> DAU ×{" "}
            <b className="text-[var(--ink)]">{reqPerUser}</b> req/user/day ={" "}
            <b className="text-[var(--ink)]">{human(reqPerDay)}</b> req/day ÷ 86,400 s ={" "}
            <b className="font-semibold text-[var(--accent-blue-link)]">{human(avgRps)}</b> req/s avg{" "}
            ··· ×{" "}
            <b className="text-[var(--ink)]">{peak}</b> peak ={" "}
            <b className="font-semibold text-[var(--accent-danger)]">{human(peakRps)}</b> req/s peak
          </p>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* left: inputs */}
          <Panel className="flex flex-col gap-6 self-start p-6">
            <p className="mono-label text-[var(--mute)]">your product</p>
            <Slider label="daily active users" min={DAU_MIN_EXP} max={DAU_MAX_EXP} step={0.01} value={exp} onChange={setExp} display={human(dau)} />
            <Slider label="requests / user / day" min={1} max={200} value={reqPerUser} onChange={setReqPerUser} />
            <Slider label="peak multiplier" min={1} max={10} step={0.1} value={peak} onChange={setPeak} display={`${peak}×`} />
          </Panel>

          {/* right: headline metrics + traffic curve */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="req / day" value={human(reqPerDay)} />
              <MetricCard label="average" value={`${human(avgRps)}/s`} tone="blue" />
              <MetricCard label="peak" value={`${human(peakRps)}/s`} tone="red" />
            </div>
            <Panel tone="stone" className="p-4 sm:p-6">
              <p className="mono-label text-[var(--mute)]">a day of traffic</p>
              <div className="mt-3">
                <TrafficCurve avg={avgRps} peak={peakRps} />
              </div>
            </Panel>
          </div>
        </div>
      </section>

      {/* 03 · Server fleet */}
      <section className="flex flex-col gap-5">
        <SectionHeader n="03" title="App server fleet" />
        <Panel className="p-6">
          <Slider label="capacity per server (req/s)" min={200} max={5000} step={100} value={appCap} onChange={setAppCap} display={`${human(appCap)}/s`} />
        </Panel>
        <div className="grid grid-cols-3 gap-x-8 gap-y-6">
          <Stat label="Servers needed" value={human(fleetNeeded)} sub={`peak ÷ (cap × ${TARGET_UTIL})`} />
          <Stat label="+ spare" value="1" sub="redundancy headroom" />
          <Stat label="Fleet total" value={human(fleetTotal)} accent sub={`@ ${TARGET_UTIL * 100}% target util`} />
        </div>
      </section>

      {/* 04 · Cache & read distribution */}
      <section className="flex flex-col gap-5">
        <SectionHeader n="04" title="Cache & read distribution" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Panel className="flex flex-col gap-6 self-start p-6">
          <Slider label="read share" min={0} max={100} value={readShare} onChange={setReadShare} display={`${readShare}%`} />
          <Slider label="cache hit rate" min={0} max={100} value={hitRate} onChange={setHitRate} display={`${hitRate}%`} />
          <Slider label="avg object size" min={0.1} max={1000} step={0.1} value={objectKb} onChange={setObjectKb} display={objectKb >= 1 ? `${Math.round(objectKb)} KB` : `${objectKb} KB`} />
        </Panel>
        <Panel tone="stone" className="flex flex-col items-center gap-8 p-6 sm:flex-row sm:items-center sm:gap-10">
          <Donut
            segments={[
              { label: "cache hits", value: cacheHitsRps, color: "var(--accent-teal)" },
              { label: "db reads", value: dbReadsRps, color: "var(--primary)" },
              { label: "writes", value: writesRps, color: "var(--accent-warning)" },
            ]}
          />
          <div className="flex flex-1 flex-col gap-3">
            {[
              { label: "Cache hits (absorbed)", v: cacheHitsRps, color: "var(--accent-teal)" },
              { label: "Database reads", v: dbReadsRps, color: "var(--primary)" },
              { label: "Database writes", v: writesRps, color: "var(--accent-warning)" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-[14px] text-[var(--ink)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                  {r.label}
                </span>
                <span className="font-mono text-[13px] text-[var(--charcoal)]">
                  {human(r.v)}/s · {Math.round((r.v / (peakRps || 1)) * 100)}%
                </span>
              </div>
            ))}
            <div className="mt-2 border-t border-[var(--hairline-light)] pt-3">
              <Stat label="Cache memory (80/20 rule)" value={bytesFmt(cacheMemBytes)} sub="20% of daily read objects" accent />
            </div>
          </div>
        </Panel>
        </div>
      </section>

      {/* 05 · Database nodes */}
      <section className="flex flex-col gap-5">
        <SectionHeader n="05" title="Database nodes" />
        <Panel className="grid gap-6 p-6 sm:grid-cols-2">
          <Slider label="reads / node (capacity)" min={1000} max={20000} step={500} value={readsPerNode} onChange={setReadsPerNode} display={`${human(readsPerNode)}/s`} />
          <Slider label="writes / node (capacity)" min={500} max={10000} step={250} value={writesPerNode} onChange={setWritesPerNode} display={`${human(writesPerNode)}/s`} />
        </Panel>
        <div className="grid grid-cols-3 gap-x-8 gap-y-6">
          <Stat label="Shards" value={human(shards)} sub={`writes ÷ ${human(writesPerNode)}`} />
          <Stat label="Replicas / shard" value={human(replicasPerShard)} sub={`db reads ÷ ${human(readsPerNode)}`} />
          <Stat label="Total nodes" value={human(totalNodes)} accent sub="shards × replicas" />
        </div>
      </section>

      {/* 06 · Storage & bandwidth */}
      <section className="flex flex-col gap-5">
        <SectionHeader n="06" title="Storage & bandwidth" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* left: inputs + numeric outputs */}
          <div className="flex flex-col gap-6 self-start">
            <Panel className="flex flex-col gap-6 p-6">
              <Slider label="replication factor" min={1} max={5} value={replication} onChange={setReplication} display={`${replication}×`} />
              <Slider label="retention" min={1} max={10} value={retention} onChange={setRetention} display={`${retention} yr`} />
            </Panel>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <Stat label="New data / day" value={bytesFmt(dailyWriteBytes)} sub={`×${replication} replication`} />
              <Stat label="Per year" value={bytesFmt(annualBytes)} />
              <Stat label={`At ${retention} yr retention`} value={bytesFmt(fullRetentionBytes)} accent />
              <Stat label="Peak egress" value={`${human(egressMbps)} Mbps`} sub="peak reads × size" />
            </div>
          </div>
          {/* right: cumulative storage bars */}
          <Panel tone="stone" className="p-6">
            <p className="mono-label text-[var(--mute)]">cumulative storage by year</p>
            <div className="mt-5 flex items-end gap-3">
              {Array.from({ length: retention }).map((_, i) => {
                const cum = annualBytes * (i + 1);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--charcoal)]">{bytesFmt(cum)}</span>
                    {/* fixed-height track so the % bar has something to resolve against */}
                    <div className="flex h-40 w-full items-end">
                      <div
                        className="w-full rounded-t-[6px] bg-[var(--primary)] transition-all"
                        style={{ height: `${Math.max(3, (cum / maxCumBytes) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-[var(--stone-text)]">yr {i + 1}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </section>

      <Note>
        These are <em>order-of-magnitude</em> numbers, and that&apos;s the
        point. A staff engineer doesn&apos;t need the cost to the dollar - they
        need to know whether the answer is &ldquo;3 servers&rdquo; or
        &ldquo;3,000&rdquo;, because those are completely different
        architectures. Try the presets, then push DAU to a billion and watch a
        single-box design become an obviously sharded, replicated, cached one.
      </Note>

      {/* Cheat sheet */}
      <section className="flex flex-col gap-5">
        <SectionHeader n="07" title="Cheat sheet - rules of thumb" />
        <Panel tone="stone" className="divide-y divide-[var(--hairline-light)] p-2 sm:p-4">
          {[
            ["1 day", "≈ 86,400 s ≈ 100,000 s - drop 5 zeros from req/day to get req/s"],
            ["App server", "≈ 1,000 req/s for plain CRUD"],
            ["Postgres", "≈ 5,000 reads/s · 2,000 writes/s per node"],
            ["Redis", "≈ 100,000 ops/s"],
            ["Cache 80/20", "20% of objects serve 80% of reads"],
            ["Target utilisation", "size fleet to 70% so spikes have headroom"],
            ["Peak factor", "2–3× daily average, up to 10× for spikes"],
            ["Replication", "3× is the durable default"],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 px-2 py-2.5 sm:flex-row sm:gap-6">
              <span className="w-40 shrink-0 font-mono text-[13px] text-[var(--ink)]">{k}</span>
              <span className="text-[14px] text-[var(--mute)]">{v}</span>
            </div>
          ))}
        </Panel>
      </section>

      {/* 08 · Latency numbers */}
      <section className="flex flex-col gap-5">
        <SectionHeader n="08" title="Latency numbers every engineer should know" />
        <p className="max-w-[60ch] text-[15px] leading-[1.55] text-[var(--mute)]">
          The other half of the math: how long operations actually take. The
          scale is logarithmic - each step right is roughly 10× slower - so you
          can feel why a cache hit, an SSD read and a transatlantic round trip
          live in completely different worlds.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
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
        <Panel tone="stone" className="divide-y divide-[var(--hairline-light)] p-2 sm:p-4">
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
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(2, logWidth(l.ns))}%`, background: color }} />
                </div>
                <span className="w-[64px] shrink-0 text-right font-mono text-[12px] text-[var(--charcoal)]">
                  {fmtNs(l.ns)}
                </span>
              </div>
            );
          })}
        </Panel>
      </section>
    </div>
  );
}
