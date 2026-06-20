"use client";

import { useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel, Slider } from "@/components/lab/ui";

// =====================================================================
// Design a unique ID generator (Alex Xu vol.1, ch.7). Twitter Snowflake:
// a sortable 64-bit ID = 1 sign + 41 timestamp + 5 datacenter + 5 machine
// + 12 sequence, generated with zero coordination between machines.
// =====================================================================

const EPOCH = BigInt("1288834974657"); // Twitter snowflake epoch (Nov 04 2010)
const P22 = BigInt(4194304); // 2^22  (datacenter+machine+sequence width)
const P17 = BigInt(131072); // 2^17  (machine+sequence width)
const P12 = BigInt(4096); // 2^12   (sequence width)

type Gen = { id: bigint; ts: bigint; seq: number };

const SECTIONS = [
  { label: "sign", bits: 1, color: "var(--stone-text)" },
  { label: "timestamp (41)", bits: 41, color: "var(--primary)" },
  { label: "datacenter (5)", bits: 5, color: "var(--accent-teal)" },
  { label: "machine (5)", bits: 5, color: "var(--accent-warning)" },
  { label: "sequence (12)", bits: 12, color: "#7c5cff" },
];

export default function SnowflakeId() {
  const [dc, setDc] = useState(7);
  const [machine, setMachine] = useState(12);
  const [history, setHistory] = useState<Gen[]>([]);
  const lastMs = useRef<bigint>(BigInt(0));
  const seq = useRef(0);

  function generate() {
    const now = BigInt(Date.now()) - EPOCH;
    if (now === lastMs.current) {
      seq.current = (seq.current + 1) % 4096; // 12-bit wrap
    } else {
      seq.current = 0;
      lastMs.current = now;
    }
    const id =
      now * P22 +
      BigInt(dc) * P17 +
      BigInt(machine) * P12 +
      BigInt(seq.current);
    setHistory((h) => [{ id, ts: now, seq: seq.current }, ...h].slice(0, 6));
  }

  function burst() {
    for (let i = 0; i < 5; i++) generate();
  }

  const latest = history[0];
  const bits = latest ? latest.id.toString(2).padStart(64, "0") : "0".repeat(64);

  // slice the 64-bit string into colored sections
  let cursor = 0;
  const colored = SECTIONS.map((s) => {
    const slice = bits.slice(cursor, cursor + s.bits);
    cursor += s.bits;
    return { ...s, slice };
  });

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Thousands of machines, each minting IDs at once, with <strong>no
        coordination</strong> and no collisions - and the IDs still sort by time.
        Twitter&apos;s Snowflake pulls it off by slicing a 64-bit integer into
        fields: a millisecond timestamp up front (so bigger = later), then who
        made it, then a per-millisecond counter.
      </Note>

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton onClick={generate}>Generate ID</ActionButton>
        <ActionButton variant="ghost" onClick={burst}>⚡ Burst ×5 (same ms)</ActionButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,300px)]">
        {/* bit layout */}
        <Panel tone="stone" className="flex flex-col gap-5 p-6">
          <p className="mono-label text-[var(--mute)]">64-bit layout</p>
          {latest ? (
            <>
              <div className="flex flex-wrap gap-[3px]">
                {colored.map((s, si) =>
                  s.slice.split("").map((b, bi) => (
                    <span
                      key={`${si}-${bi}`}
                      className="grid h-6 w-[18px] place-items-center rounded-[3px] font-mono text-[11px] text-white"
                      style={{ background: s.color, opacity: b === "1" ? 1 : 0.32 }}
                    >
                      {b}
                    </span>
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {SECTIONS.map((s) => (
                  <span key={s.label} className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink)]">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
              <div className="border-t border-[var(--hairline-light)] pt-4">
                <p className="mono-label text-[10px] text-[var(--stone-text)]">decimal ID</p>
                <p className="mt-1 break-all font-mono text-[16px] font-medium text-[var(--ink)]">{latest.id.toString()}</p>
              </div>
            </>
          ) : (
            <p className="py-10 text-center font-mono text-[13px] text-[var(--stone-text)]">generate an ID to see its bits</p>
          )}
        </Panel>

        {/* controls + history */}
        <div className="flex flex-col gap-5">
          <Panel className="flex flex-col gap-5 p-6">
            <Slider label="datacenter ID (5 bits · 0-31)" min={0} max={31} value={dc} onChange={setDc} />
            <Slider label="machine ID (5 bits · 0-31)" min={0} max={31} value={machine} onChange={setMachine} />
          </Panel>
          <Panel tone="stone" className="p-5">
            <p className="mono-label text-[var(--mute)]">recent IDs (newest first)</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {history.length === 0 && <span className="font-mono text-[12px] text-[var(--stone-text)]">none yet</span>}
              {history.map((g, i) => (
                <span key={`${g.id}-${i}`} className="break-all font-mono text-[12px] text-[var(--charcoal)]">
                  {g.id.toString()} <span className="text-[var(--stone-text)]">· seq {g.seq}</span>
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Callout label="// why it stays unique and sortable" tone="key">
        The 41-bit timestamp sits in the highest bits, so a later millisecond
        always yields a larger number - IDs are <strong>k-sortable by time</strong>
        without a central counter. Within a single millisecond the 12-bit{" "}
        <strong>sequence</strong> counts up to 4,096 IDs per machine; hit Burst and
        watch only the sequence change. Datacenter + machine bits keep two
        machines from ever colliding. 41 timestamp bits last ~69 years from the
        custom epoch.
      </Callout>

      <Note>
        The alternatives all fall short: a UUID is 128 bits and not sortable; a
        ticket server is a single point of failure; auto-increment needs database
        coordination. Snowflake&apos;s divide-and-conquer is why it underpins IDs
        at Twitter, Discord, Instagram and more.
      </Note>
    </div>
  );
}
