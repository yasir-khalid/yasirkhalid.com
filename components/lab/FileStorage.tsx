"use client";

import { useState } from "react";
import { ActionButton, Callout, Note, Panel } from "@/components/lab/ui";

// =====================================================================
// Design a file store / Google Drive (Alex Xu vol.1, ch.15). The key
// optimization: split a file into fixed blocks and delta-sync only the
// blocks whose hash changed.
// =====================================================================

const BLOCK_MB = 4;
const COUNT = 8;

function rand() {
  return Math.random().toString(16).slice(2, 8);
}

// Deterministic per-index hash for the INITIAL render so server and client
// markup match (Math.random in initial state causes a hydration mismatch).
// Edits use rand() since they only ever run client-side.
function seedHash(i: number): string {
  let h = ((i + 1) * 0x9e3779b1) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  return (h >>> 8).toString(16).padStart(6, "0").slice(0, 6);
}

type Block = { id: number; hash: string; synced: string };

function freshBlocks(): Block[] {
  return Array.from({ length: COUNT }, (_, i) => {
    const h = seedHash(i);
    return { id: i, hash: h, synced: h };
  });
}

export default function FileStorage() {
  const [blocks, setBlocks] = useState<Block[]>(freshBlocks);
  const [lastTransfer, setLastTransfer] = useState<number | null>(null);

  const dirty = blocks.filter((b) => b.hash !== b.synced);

  function edit(id: number) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, hash: rand() } : b)));
    setLastTransfer(null);
  }
  function sync() {
    setLastTransfer(dirty.length * BLOCK_MB);
    setBlocks((bs) => bs.map((b) => ({ ...b, synced: b.hash })));
  }
  function reset() {
    setBlocks(freshBlocks());
    setLastTransfer(null);
  }

  const fullMb = COUNT * BLOCK_MB;
  const deltaMb = dirty.length * BLOCK_MB;
  const savedPct = Math.round((1 - deltaMb / fullMb) * 100);

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Re-uploading a whole file every time you change one line wastes enormous
        bandwidth. Drive-style storage splits each file into fixed{" "}
        <strong>{BLOCK_MB}MB blocks</strong>, each identified by a{" "}
        <strong>hash</strong> of its contents. When you save, only the blocks whose
        hash changed are sent - <strong>delta sync</strong>.
      </Note>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton onClick={sync} disabled={dirty.length === 0}>↑ Sync ({dirty.length} block{dirty.length === 1 ? "" : "s"})</ActionButton>
        <ActionButton variant="ghost" onClick={reset}>Reset file</ActionButton>
        <span className="ml-1 text-[13px] text-[var(--mute)]">click a block to edit it</span>
      </div>

      {/* the file as blocks */}
      <Panel tone="stone" className="p-6">
        <p className="mono-label text-[var(--mute)]">document.psd · {fullMb} MB · {COUNT} blocks</p>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {blocks.map((b) => {
            const isDirty = b.hash !== b.synced;
            return (
              <button
                key={b.id}
                onClick={() => edit(b.id)}
                className={`flex flex-col items-center gap-1 rounded-[4px] border p-3 transition-all ${
                  isDirty
                    ? "lab-pop border-[var(--accent-warning)] bg-[rgba(236,126,0,0.1)]"
                    : "border-[var(--hairline-light)] bg-white hover:border-[var(--ink)]"
                }`}
              >
                <span className="font-mono text-[10px] text-[var(--stone-text)]">blk {b.id}</span>
                <span className={`font-mono text-[12px] ${isDirty ? "text-[var(--accent-warning)]" : "text-[var(--ink)]"}`}>{b.hash}</span>
                <span className={`font-mono text-[9px] ${isDirty ? "text-[var(--accent-warning)]" : "text-[var(--accent-teal)]"}`}>{isDirty ? "changed" : "synced"}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* transfer comparison */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[var(--hairline-light)] bg-white p-4">
          <p className="mono-label text-[10px] text-[var(--stone-text)]">full re-upload</p>
          <p className="display mt-1.5 text-[1.6rem] text-[var(--stone-text)]">{fullMb} MB</p>
        </div>
        <div className="rounded-[12px] border border-[var(--hairline-light)] bg-white p-4">
          <p className="mono-label text-[10px] text-[var(--accent-warning)]">delta sync now</p>
          <p className="display mt-1.5 text-[1.6rem] text-[var(--ink)]">{deltaMb} MB</p>
        </div>
        <div className="rounded-[12px] border border-[var(--hairline-light)] bg-white p-4">
          <p className="mono-label text-[10px] text-[var(--accent-teal)]">bandwidth saved</p>
          <p className="display mt-1.5 text-[1.6rem] text-[var(--accent-teal)]">{dirty.length ? `${savedPct}%` : "-"}</p>
        </div>
      </div>

      {lastTransfer !== null && (
        <Callout label="// synced" tone="info">
          Transferred <strong>{lastTransfer} MB</strong> instead of {fullMb} MB.
          Only the changed blocks crossed the wire; the metadata service updated
          their hashes and bumped the file version, then the notification service
          told your other devices to pull just those blocks.
        </Callout>
      )}

      <Callout label="// blocks, hashes and dedup" tone="key">
        Content-addressed blocks unlock three wins at once: <strong>delta
        sync</strong> (send only changed blocks), <strong>deduplication</strong>
        (two files sharing a block store it once), and easy{" "}
        <strong>versioning</strong> (a version is just a list of block hashes).
        Blocks are also compressed and encrypted before upload. Dropbox caps block
        size at 4MB for exactly this design.
      </Callout>

      <Note>
        The other hard part is <strong>conflict resolution</strong>: if two people
        edit the same file at once, the first write wins and the second is handed
        back as a conflict to merge - the metadata database, not the block store,
        is the source of truth for which version is current.
      </Note>
    </div>
  );
}
