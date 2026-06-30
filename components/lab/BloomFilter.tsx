"use client";

import { useMemo, useState } from "react";
import { ActionButton, Note, Panel } from "@/components/lab/ui";

const M = 30; // bits
const K = 3; // hash functions

// Three independent string hashes → bit indices in [0, M).
function hashes(s: string): number[] {
  const seeds = [2166136261, 5381, 52711];
  return seeds.map((seed) => {
    let h = seed >>> 0;
    for (let i = 0; i < s.length; i++) {
      h = (h ^ s.charCodeAt(i)) >>> 0;
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h % M;
  });
}

const SUGGESTIONS = ["apple", "banana", "cherry", "mango", "kiwi"];

export default function BloomFilter() {
  const [bits, setBits] = useState<boolean[]>(() => Array(M).fill(false));
  const [added, setAdded] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<number[]>([]);
  const [addInput, setAddInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [result, setResult] = useState<{
    word: string;
    indices: number[];
    present: boolean;
    truly: boolean;
  } | null>(null);

  const setCount = bits.filter(Boolean).length;
  const fpRate = useMemo(() => {
    const n = added.length;
    if (n === 0) return 0;
    return Math.pow(1 - Math.exp((-K * n) / M), K);
  }, [added.length]);

  function add(word: string) {
    const w = word.trim().toLowerCase();
    if (!w || added.includes(w)) return;
    const idx = hashes(w);
    setBits((prev) => {
      const next = [...prev];
      idx.forEach((i) => (next[i] = true));
      return next;
    });
    setAdded((prev) => [...prev, w]);
    setHighlight(idx);
    setResult(null);
    setAddInput("");
  }

  function query(word: string) {
    const w = word.trim().toLowerCase();
    if (!w) return;
    const idx = hashes(w);
    const present = idx.every((i) => bits[i]);
    setHighlight(idx);
    setResult({ word: w, indices: idx, present, truly: added.includes(w) });
  }

  function reset() {
    setBits(Array(M).fill(false));
    setAdded([]);
    setHighlight([]);
    setResult(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A bloom filter is a row of bits, all starting at <strong>0</strong>. To
        add a word, run it through {K} hash functions, each pointing at one bit,
        and flip those bits to <strong>1</strong>. To check membership, hash
        again: if <em>any</em> of those bits is still 0, the word was{" "}
        <strong>definitely never added</strong>. If all are 1, it&apos;s{" "}
        <strong>probably</strong> there - but other words may have set the same
        bits.
      </Note>

      {/* Bit array */}
      <Panel tone="stone" className="p-6 pt-7">
        <div className="mb-4 flex items-center justify-between">
          <span className="mono-label text-[var(--mute)]">
            bit array · m = {M}
          </span>
          <span className="font-mono text-[12px] text-[var(--mute)]">
            {setCount}/{M} set
          </span>
        </div>
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
          {bits.map((b, i) => {
            const hot = highlight.includes(i);
            return (
              <div
                key={i}
                className={`relative flex aspect-square items-center justify-center rounded-[6px] border font-mono text-[13px] transition-colors ${
                  b
                    ? "border-transparent bg-[var(--primary)] text-white"
                    : "border-[var(--hairline-light)] bg-white text-[var(--faint)]"
                } ${hot ? "lab-pop ring-2 ring-[var(--ink)]" : ""}`}
              >
                {b ? 1 : 0}
                <span className="absolute -top-3.5 left-0 right-0 text-center font-mono text-[8px] text-[var(--stone-text)]">
                  {i}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Add */}
        <Panel className="p-6">
          <p className="mono-label text-[var(--slate)]">// add a word</p>
          <div className="mt-4 flex gap-2">
            <input
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add(addInput)}
              placeholder="type a word…"
              className="w-full rounded-[4px] border border-[var(--hairline)] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[var(--ink)]"
            />
            <ActionButton onClick={() => add(addInput)}>Add</ActionButton>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => add(s)}
                disabled={added.includes(s)}
                className="tag-mono transition-colors hover:border-[var(--ink)] disabled:opacity-30"
              >
                + {s}
              </button>
            ))}
          </div>
          {added.length > 0 && (
            <div className="mt-5 border-t border-[var(--hairline)] pt-4">
              <p className="mono-label text-[var(--muted)]">
                in the set ({added.length})
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {added.map((w) => (
                  <span key={w} className="chip-coral">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* Query */}
        <Panel className="p-6">
          <p className="mono-label text-[var(--slate)]">// check membership</p>
          <div className="mt-4 flex gap-2">
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && query(queryInput)}
              placeholder="is it in the set?"
              className="w-full rounded-[4px] border border-[var(--hairline)] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[var(--ink)]"
            />
            <ActionButton variant="ghost" onClick={() => query(queryInput)}>
              Check
            </ActionButton>
          </div>

          {result && (
            <div className="mt-5">
              <div
                className={`rounded-[4px] px-4 py-3 ${
                  result.present
                    ? "bg-[var(--green-wash)]"
                    : "bg-[#fff5f2]"
                }`}
              >
                <p className="font-mono text-[13px]">
                  bits [{result.indices.join(", ")}]
                </p>
                <p
                  className={`heading mt-1 text-[18px] ${
                    result.present
                      ? "text-[var(--green)]"
                      : "text-[#c2412a]"
                  }`}
                >
                  {result.present
                    ? "Maybe present"
                    : "Definitely not present"}
                </p>
                {result.present && !result.truly && (
                  <p className="mt-1.5 text-[13px] font-medium text-[#c2412a]">
                    ⚠ False positive - “{result.word}” was never added, but its
                    bits were all set by other words.
                  </p>
                )}
                {result.present && result.truly && (
                  <p className="mt-1.5 text-[13px] text-[var(--slate)]">
                    And it really is in the set. No false positive here.
                  </p>
                )}
                {!result.present && (
                  <p className="mt-1.5 text-[13px] text-[var(--slate)]">
                    At least one bit is 0 - a bloom filter never gives false
                    negatives.
                  </p>
                )}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Stats + reset */}
      <Panel tone="stone" className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="mono-label text-[var(--muted)]">items added</p>
            <p className="display mt-1 text-[24px] text-[var(--ink)]">
              {added.length}
            </p>
          </div>
          <div>
            <p className="mono-label text-[var(--muted)]">fill</p>
            <p className="display mt-1 text-[24px] text-[var(--ink)]">
              {Math.round((setCount / M) * 100)}%
            </p>
          </div>
          <div>
            <p className="mono-label text-[var(--muted)]">est. false-positive rate</p>
            <p className="display mt-1 text-[24px] text-[var(--coral)]">
              {(fpRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <ActionButton variant="ghost" onClick={reset}>
          Reset
        </ActionButton>
      </Panel>

      <Note>
        Notice the trade: the filter uses a tiny, fixed amount of memory no
        matter how many items you add - but the more you add, the fuller the bit
        array gets, and the more often unrelated lookups collide into a false
        positive. That&apos;s the whole bargain: <strong>space</strong> for a{" "}
        <strong>small, controllable error rate</strong>, and never a wrong
        &ldquo;no&rdquo;.
      </Note>
    </div>
  );
}
