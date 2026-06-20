"use client";

import { useMemo, useState } from "react";
import { Callout, Note, Panel } from "@/components/lab/ui";

// =====================================================================
// Design search autocomplete (Alex Xu vol.1, ch.13). A trie (prefix tree)
// of past queries, ranked by frequency, returns the top-k as you type.
// =====================================================================

const QUERIES: [string, number][] = [
  ["the", 40], ["that", 28], ["true", 25], ["this", 22], ["try", 30],
  ["tree", 18], ["top", 15], ["trie", 12], ["then", 11], ["trip", 9],
  ["toy", 7], ["tor", 5],
];
const K = 5;

type TrieNode = { ch: string; freq: number; children: TrieNode[] };

function buildTrie(): TrieNode {
  const root: TrieNode = { ch: "", freq: 0, children: [] };
  for (const [word, freq] of QUERIES) {
    let node = root;
    for (const c of word) {
      let child = node.children.find((n) => n.ch === c);
      if (!child) {
        child = { ch: c, freq: 0, children: [] };
        node.children.push(child);
      }
      node = child;
    }
    node.freq = freq;
  }
  const sort = (n: TrieNode) => {
    n.children.sort((a, b) => a.ch.localeCompare(b.ch));
    n.children.forEach(sort);
  };
  sort(root);
  return root;
}

function nodeAt(root: TrieNode, prefix: string): TrieNode | null {
  let node = root;
  for (const c of prefix) {
    const child = node.children.find((n) => n.ch === c);
    if (!child) return null;
    node = child;
  }
  return node;
}

function collect(node: TrieNode, acc: string, out: [string, number][]) {
  if (node.freq > 0) out.push([acc, node.freq]);
  for (const c of node.children) collect(c, acc + c.ch, out);
}

const TRIE = buildTrie();

export default function Autocomplete() {
  const [prefix, setPrefix] = useState("tr");

  const suggestions = useMemo(() => {
    if (!prefix) return [];
    const node = nodeAt(TRIE, prefix);
    if (!node) return [];
    const out: [string, number][] = [];
    collect(node, prefix, out);
    return out.sort((a, b) => b[1] - a[1]).slice(0, K);
  }, [prefix]);

  const maxFreq = Math.max(1, ...suggestions.map((s) => s[1]));

  // recursive trie render, colouring by relationship to the typed prefix
  function render(node: TrieNode, acc: string, depth: number): React.ReactNode {
    return node.children.map((child) => {
      const next = acc + child.ch;
      const onPath = prefix.length > 0 && next.length <= prefix.length && prefix.startsWith(next);
      const inMatch = prefix.length > 0 && next.startsWith(prefix);
      const tone = onPath
        ? "border-[var(--primary)] bg-[rgba(73,79,223,0.1)] text-[var(--primary)]"
        : inMatch
          ? "border-[rgba(0,168,126,0.4)] bg-[rgba(0,168,126,0.08)] text-[var(--accent-teal)]"
          : "border-[var(--hairline-light)] text-[var(--mute)]";
      return (
        <div key={next} className="flex flex-col" style={{ marginLeft: depth ? 14 : 0 }}>
          <div className="flex items-center gap-2 py-0.5">
            <span className={`grid h-7 w-7 place-items-center rounded-[7px] border font-mono text-[13px] ${tone}`}>{child.ch}</span>
            {child.freq > 0 && (
              <span className="font-mono text-[11px] text-[var(--stone-text)]">{next} · {child.freq}</span>
            )}
          </div>
          {child.children.length > 0 && <div className="border-l border-[var(--hairline-light)]">{render(child, next, depth + 1)}</div>}
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Autocomplete has to answer in a few milliseconds, so it can&apos;t run a
        SQL query per keystroke. Instead it walks a <strong>trie</strong> (prefix
        tree): every node is one character, and a path from the root spells a past
        query. Type a prefix, jump to that node, gather the words beneath it, and
        return the most frequent.
      </Note>

      <Panel className="flex items-center gap-3 p-6">
        <span className="font-mono text-[14px] text-[var(--stone-text)]">search:</span>
        <input
          value={prefix}
          onChange={(e) => setPrefix(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
          placeholder="type a prefix (try, th, to…)"
          className="flex-1 rounded-[10px] border border-[var(--hairline)] bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[var(--ink)]"
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* suggestions */}
        <Panel tone="stone" className="p-6">
          <p className="mono-label text-[var(--mute)]">top {K} suggestions</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {suggestions.length === 0 ? (
              <span className="font-mono text-[13px] text-[var(--stone-text)]">{prefix ? `no queries start with "${prefix}"` : "start typing"}</span>
            ) : (
              suggestions.map(([word, freq], i) => (
                <div key={word} className="flex items-center gap-3">
                  <span className="w-5 font-mono text-[12px] text-[var(--stone-text)]">{i + 1}</span>
                  <span className="w-20 text-[15px] font-medium text-[var(--ink)]">
                    <b className="text-[var(--primary)]">{prefix}</b>{word.slice(prefix.length)}
                  </span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--hairline-light)]">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent-teal)]" style={{ width: `${(freq / maxFreq) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-[12px] text-[var(--charcoal)]">{freq}</span>
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* trie */}
        <Panel className="overflow-auto p-6">
          <p className="mono-label text-[var(--mute)]">the trie (root → queries)</p>
          <div className="mt-4">{render(TRIE, "", 0)}</div>
        </Panel>
      </div>

      <Callout label="// O(p) + O(c) + O(c log c)" tone="key">
        Finding the prefix node is <strong>O(p)</strong> in the prefix length;
        gathering its children is <strong>O(c)</strong>; sorting them by frequency
        is <strong>O(c log c)</strong>. To make it instant at scale, production
        tries <strong>cache the top-k queries at every node</strong> - so a lookup
        is just &ldquo;walk to the prefix, read the cached list&rdquo;, trading
        memory for speed.
      </Callout>

      <Note>
        The cobalt nodes are your prefix path; the teal subtree below is every
        completion that matches. The data feeding this trie is rebuilt offline
        from aggregated search logs - autocomplete is read-heavy and tolerant of
        being slightly stale, which is what makes the heavy caching safe.
      </Note>
    </div>
  );
}
