"use client";

import { useState } from "react";
import { Note, Panel, Slider } from "@/components/lab/ui";

type Curve = {
  key: string;
  label: string;
  color: string;
  fn: (n: number) => number;
  note: string;
};

const CURVES: Curve[] = [
  { key: "o1", label: "O(1)", color: "#50b783", fn: () => 1, note: "constant" },
  { key: "olog", label: "O(log n)", color: "#1863dc", fn: (n) => Math.log2(n), note: "logarithmic" },
  { key: "on", label: "O(n)", color: "#071829", fn: (n) => n, note: "linear" },
  { key: "onlog", label: "O(n log n)", color: "#9a7b00", fn: (n) => n * Math.log2(n), note: "linearithmic" },
  { key: "on2", label: "O(n²)", color: "#ff7759", fn: (n) => n * n, note: "quadratic" },
  { key: "o2n", label: "O(2ⁿ)", color: "#b3261e", fn: (n) => Math.pow(2, n), note: "exponential" },
];

const MAX_N = 40;
const CEIL = 120; // operations ceiling — curves clip above this
const W = 720;
const H = 420;
const PAD = 44;

function fmt(v: number): string {
  if (v < 1000) return v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v).toString();
  if (v < 1e6) return (v / 1e3).toFixed(1) + "k";
  if (v < 1e9) return (v / 1e6).toFixed(1) + "M";
  if (v < 1e12) return (v / 1e9).toFixed(1) + "B";
  return v.toExponential(1);
}

export default function BigO() {
  const [n, setN] = useState(12);
  const [on, setOn] = useState<Record<string, boolean>>(
    Object.fromEntries(CURVES.map((c) => [c.key, true]))
  );

  const xOf = (i: number) => PAD + (i / MAX_N) * (W - 2 * PAD);
  const yOf = (v: number) => H - PAD - (Math.min(v, CEIL) / CEIL) * (H - 2 * PAD);

  function path(fn: (x: number) => number) {
    let d = "";
    for (let i = 1; i <= MAX_N; i += 0.5) {
      d += `${d ? "L" : "M"}${xOf(i).toFixed(1)} ${yOf(fn(i)).toFixed(1)} `;
    }
    return d;
  }

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Big O describes how an algorithm&apos;s work grows as its input{" "}
        <strong>n</strong> gets large. The constants don&apos;t matter — the{" "}
        <em>shape</em> does. Drag <strong>n</strong> and watch which curves stay
        flat and which ones rocket off the top of the chart.
      </Note>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2">
        {CURVES.map((c) => {
          const active = on[c.key];
          return (
            <button
              key={c.key}
              onClick={() => setOn((s) => ({ ...s, [c.key]: !s[c.key] }))}
              className="inline-flex items-center gap-2 rounded-[8px] border px-3 py-1.5 font-mono text-[13px] transition-all"
              style={{
                borderColor: active ? c.color : "var(--hairline)",
                background: active ? c.color : "transparent",
                color: active ? "#fff" : "var(--muted)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: active ? "#fff" : c.color }}
              />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <Panel className="p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Complexity growth chart">
          {/* grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD}
              x2={W - PAD}
              y1={H - PAD - t * (H - 2 * PAD)}
              y2={H - PAD - t * (H - 2 * PAD)}
              stroke="var(--hairline)"
              strokeWidth={1}
            />
          ))}
          {/* axes labels */}
          <text x={PAD} y={H - 14} className="font-mono" fontSize={12} fill="var(--muted)">
            n = 1
          </text>
          <text x={W - PAD} y={H - 14} textAnchor="end" className="font-mono" fontSize={12} fill="var(--muted)">
            n = {MAX_N}
          </text>
          <text x={10} y={PAD} className="font-mono" fontSize={12} fill="var(--muted)">
            ops
          </text>
          <text x={W - PAD + 6} y={PAD - 6} textAnchor="end" className="font-mono" fontSize={11} fill="var(--coral)">
            ↑ {CEIL}+ (clipped)
          </text>

          {/* current-n marker */}
          <line
            x1={xOf(n)}
            x2={xOf(n)}
            y1={PAD}
            y2={H - PAD}
            stroke="var(--ink)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text x={xOf(n)} y={PAD - 8} textAnchor="middle" className="font-mono" fontSize={12} fill="var(--ink)">
            n = {n}
          </text>

          {/* curves */}
          {CURVES.filter((c) => on[c.key]).map((c) => (
            <g key={c.key}>
              <path d={path(c.fn)} fill="none" stroke={c.color} strokeWidth={2.5} strokeLinecap="round" />
              <circle cx={xOf(n)} cy={yOf(c.fn(n))} r={4.5} fill={c.color} stroke="#fff" strokeWidth={2} />
            </g>
          ))}
        </svg>
      </Panel>

      {/* Op counts at current n */}
      <Panel tone="stone" className="p-5">
        <p className="mono-label text-[var(--muted)]">
          operations at n = {n}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
          {CURVES.map((c) => (
            <div key={c.key} className={on[c.key] ? "" : "opacity-30"}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                <span className="font-mono text-[12px] text-[var(--slate)]">{c.label}</span>
              </div>
              <p className="display mt-1 text-[22px]" style={{ color: c.color }}>
                {fmt(c.fn(n))}
              </p>
              <p className="text-[11px] text-[var(--muted)]">{c.note}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="max-w-[420px]">
        <Slider label="input size n" min={1} max={MAX_N} value={n} onChange={setN} />
      </div>

      <Note>
        At <strong>n = 10</strong> the difference looks academic. Push n to 40
        and O(2ⁿ) is over a <em>trillion</em> operations while O(log n) is still
        under 6. This is why an algorithm that&apos;s &ldquo;fast enough&rdquo;
        on test data can fall off a cliff in production — the input grew, and
        the <em>shape</em> caught up with it.
      </Note>
    </div>
  );
}
