"use client";

import { useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel } from "@/components/lab/ui";

// =====================================================================
// Design a URL shortener (Alex Xu vol.1, ch.8). A unique ID from the
// generator, turned into a 7-char code by base-62 conversion.
// =====================================================================

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function base62(n: number): { code: string; steps: { q: number; r: number; ch: string }[] } {
  if (n === 0) return { code: "0", steps: [{ q: 0, r: 0, ch: "0" }] };
  const steps: { q: number; r: number; ch: string }[] = [];
  let x = n;
  let code = "";
  while (x > 0) {
    const r = x % 62;
    const q = Math.floor(x / 62);
    steps.push({ q, r, ch: ALPHABET[r] });
    code = ALPHABET[r] + code;
    x = q;
  }
  return { code, steps: steps.reverse() };
}

type Row = { id: number; code: string; long: string };

export default function UrlShortener() {
  const [input, setInput] = useState("https://en.wikipedia.org/wiki/Systems_design");
  const [rows, setRows] = useState<Row[]>([]);
  const [redirect, setRedirect] = useState<string | null>(null);
  const counter = useRef(2009215674);

  function shorten() {
    const long = input.trim();
    if (!long) return;
    const existing = rows.find((r) => r.long === long);
    if (existing) {
      setRedirect(existing.code);
      return;
    }
    const id = counter.current++;
    const { code } = base62(id);
    setRows((prev) => [{ id, code, long }, ...prev].slice(0, 6));
    setRedirect(null);
  }

  const latest = rows[0];
  const breakdown = latest ? base62(latest.id) : null;

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A URL shortener is mostly a giant lookup table - the only real puzzle is
        the code itself. Ask the <strong>ID generator</strong> for a fresh unique
        number, then write it in <strong>base 62</strong> (0-9, a-z, A-Z). Seven
        base-62 characters cover 62⁷ ≈ 3.5 trillion URLs.
      </Note>

      <Panel className="flex flex-col gap-3 p-6 sm:flex-row sm:items-end">
        <div className="flex-1">
          <p className="mono-label text-[var(--slate)]">// long URL</p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && shorten()}
            className="mt-3 w-full rounded-[4px] border border-[var(--hairline)] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[var(--ink)]"
          />
        </div>
        <ActionButton onClick={shorten}>Shorten →</ActionButton>
      </Panel>

      {breakdown && latest && (
        <Panel tone="stone" className="flex flex-col gap-4 p-6">
          <p className="mono-label text-[var(--mute)]">base 62 conversion</p>
          <p className="font-mono text-[13px] text-[var(--charcoal)]">
            unique ID <b className="text-[var(--ink)]">{latest.id}</b> ÷ 62 repeatedly · remainders become digits
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {breakdown.steps.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="rounded-[8px] border border-[var(--hairline-light)] bg-white px-2.5 py-1.5 font-mono text-[12px] text-[var(--mute)]">
                  rem {s.r} → <b className="text-[var(--primary)]">{s.ch}</b>
                </span>
                {i < breakdown.steps.length - 1 && <span className="text-[var(--stone-text)]">·</span>}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-baseline gap-2 border-t border-[var(--hairline-light)] pt-4">
            <span className="font-mono text-[14px] text-[var(--stone-text)]">tinyurl.com/</span>
            <span className="font-mono text-[22px] font-semibold text-[var(--ink)]">{latest.code}</span>
          </div>
        </Panel>
      )}

      {rows.length > 0 && (
        <Panel className="overflow-hidden p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--hairline-light)] font-mono text-[10px] uppercase tracking-wide text-[var(--stone-text)]">
                <th className="px-4 py-3 font-medium">short</th>
                <th className="px-4 py-3 font-medium">id</th>
                <th className="px-4 py-3 font-medium">long URL</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setRedirect(row.code)}
                  className={`cursor-pointer border-b border-[var(--hairline-light)] transition-colors last:border-0 hover:bg-[var(--surface-soft)] ${
                    redirect === row.code ? "bg-[rgba(0,168,126,0.07)]" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-[14px] font-medium text-[var(--primary)]">/{row.code}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--stone-text)]">{row.id}</td>
                  <td className="max-w-[1px] truncate px-4 py-3 text-[13px] text-[var(--mute)]">{row.long}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {redirect && (
        <Callout label="// 301 redirect" tone="info">
          A click on <b>/{redirect}</b> hits the read path: look the code up,
          return <strong>301 Moved Permanently</strong> with the long URL in the{" "}
          <code>Location</code> header, and the browser follows. This path is read
          heavy (~10:1), so the mapping lives in a cache - the database is barely
          touched. (A 302 instead of 301 lets you keep counting clicks.)
        </Callout>
      )}

      <Callout label="// why base 62, not a hash" tone="key">
        You could hash the long URL (MD5/CRC32) and take 7 chars, but then you
        must handle <strong>collisions</strong> - two URLs wanting the same code -
        usually with a bloom filter and retries. Base-62 of a guaranteed-unique ID
        sidesteps collisions entirely: every ID maps to exactly one code, and the
        codes grow predictably as the counter climbs.
      </Callout>
    </div>
  );
}
