"use client";

import { useMemo, useState } from "react";
import { ActionButton, Note, Panel, Slider } from "@/components/lab/ui";

type Item = { id: number; key: string; hash: number };

// Deterministic 32-bit string hash (FNV-1a). The raw hash is independent of
// table size - only the final modulo decides the bucket.
function fnv1a(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const WORDS = [
  "red", "blue", "green", "gold", "teal", "rose", "lime", "navy",
  "plum", "sage", "ruby", "jade", "coral", "amber", "slate", "mint",
];

export default function Hashing() {
  const [buckets, setBuckets] = useState(8);
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [lastId, setLastId] = useState<number | null>(null);
  const nextId = useMemo(
    () => (items.length ? Math.max(...items.map((i) => i.id)) + 1 : 0),
    [items]
  );

  function add(raw: string) {
    const key = raw.trim().toLowerCase();
    if (!key) return;
    const hash = fnv1a(key);
    setItems((prev) => [...prev, { id: nextId, key, hash }]);
    setLastId(nextId);
    setInput("");
  }

  function addRandom() {
    const pool = WORDS.filter((w) => !items.some((i) => i.key === w));
    const word = (pool.length ? pool : WORDS)[
      Math.floor(Math.random() * (pool.length ? pool.length : WORDS.length))
    ];
    add(word + (items.some((i) => i.key === word) ? Math.floor(Math.random() * 90 + 10) : ""));
  }

  function reset() {
    setItems([]);
    setLastId(null);
  }

  // Distribute items into buckets by hash % buckets.
  const table: Item[][] = Array.from({ length: buckets }, () => []);
  items.forEach((it) => table[it.hash % buckets].push(it));

  const loadFactor = items.length / buckets;
  const collisions = table.filter((b) => b.length > 1).reduce(
    (acc, b) => acc + (b.length - 1),
    0
  );
  const maxDepth = Math.max(1, ...table.map((b) => b.length));

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A hash table turns a key into an array index. Run the key through a{" "}
        <strong>hash function</strong> to get a big number, then take it{" "}
        <strong>modulo the table size</strong> to land in a bucket. Two
        different keys can land in the same bucket - a{" "}
        <strong>collision</strong> - so each bucket holds a small chain.
      </Note>

      {/* Controls */}
      <Panel className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <p className="mono-label text-[var(--slate)]">// insert a key</p>
          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add(input)}
              placeholder="type a key…"
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[var(--ink)]"
            />
            <ActionButton onClick={() => add(input)}>Hash</ActionButton>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={addRandom}
              className="tag-mono transition-colors hover:border-[var(--ink)]"
            >
              + random key
            </button>
            <button
              onClick={reset}
              className="tag-mono transition-colors hover:border-[var(--ink)]"
            >
              reset
            </button>
          </div>
        </div>
        <div className="w-full sm:max-w-[240px]">
          <Slider
            label="table size (buckets)"
            min={4}
            max={16}
            value={buckets}
            onChange={setBuckets}
          />
        </div>
      </Panel>

      {/* Last hash breakdown */}
      {lastId !== null &&
        (() => {
          const it = items.find((i) => i.id === lastId);
          if (!it) return null;
          return (
            <Panel tone="stone" className="p-5">
              <p className="font-mono text-[13px] leading-relaxed text-[var(--body)]">
                <span className="font-medium text-[var(--primary)]">
                  &quot;{it.key}&quot;
                </span>{" "}
                → hash{" "}
                <span className="text-[var(--ink)]">{it.hash.toLocaleString()}</span>{" "}
                <span className="text-[var(--stone-text)]">% {buckets}</span> ={" "}
                <span className="rounded bg-[var(--primary)] px-1.5 py-0.5 text-white">
                  bucket {it.hash % buckets}
                </span>
              </p>
            </Panel>
          );
        })()}

      {/* Buckets */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(buckets, 8)}, minmax(0, 1fr))`,
        }}
      >
        {table.map((bucket, i) => (
          <div key={i} className="flex flex-col">
            <div
              className={`mb-2 rounded-[8px] border px-2 py-1.5 text-center font-mono text-[12px] ${
                bucket.length > 1
                  ? "border-[var(--coral-soft)] bg-[#fff5f2] text-[#c2412a]"
                  : "border-[var(--hairline)] bg-[var(--stone)] text-[var(--slate)]"
              }`}
            >
              {i}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              {bucket.map((it, depth) => (
                <div
                  key={it.id}
                  className={`rounded-[8px] px-2 py-2 text-center text-[12px] font-medium ${
                    it.id === lastId
                      ? "lab-pop bg-[var(--coral)] text-white"
                      : depth > 0
                        ? "bg-[var(--coral-soft)]/40 text-[#c2412a]"
                        : "bg-[var(--green-wash)] text-[var(--green)]"
                  }`}
                  title={`hash ${it.hash}`}
                >
                  {it.key}
                </div>
              ))}
              {bucket.length === 0 && (
                <div className="rounded-[8px] border border-dashed border-[var(--hairline)] py-2 text-center text-[11px] text-[var(--muted)]">
                  empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <Panel tone="stone" className="flex flex-wrap gap-8 p-5">
        <div>
          <p className="mono-label text-[var(--muted)]">keys</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">
            {items.length}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">load factor (n/m)</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">
            {loadFactor.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">collisions</p>
          <p className="display mt-1 text-[24px] text-[var(--coral)]">
            {collisions}
          </p>
        </div>
        <div>
          <p className="mono-label text-[var(--muted)]">longest chain</p>
          <p className="display mt-1 text-[24px] text-[var(--ink)]">
            {maxDepth}
          </p>
        </div>
      </Panel>

      <Note>
        Try this: insert eight keys into eight buckets. You&apos;d hope for one
        per bucket, but you won&apos;t get it - random hashing clusters (the{" "}
        <em>birthday paradox</em>). Now <strong>shrink the table</strong> and
        watch chains grow: a lookup has to walk the chain, so performance
        decays from O(1) toward O(n) as the load factor climbs. Real hash maps
        fix this by <strong>resizing</strong> once the load factor passes ~0.75.
      </Note>
    </div>
  );
}
