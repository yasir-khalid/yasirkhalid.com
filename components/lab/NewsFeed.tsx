"use client";

import { useState } from "react";
import { ActionButton, Callout, Note, Panel, Segmented, Slider } from "@/components/lab/ui";

// =====================================================================
// Design a news feed (Alex Xu vol.1, ch.11). The whole design hinges on
// one choice: fan-out on write (push) vs fan-out on read (pull).
// =====================================================================

type Model = "write" | "read";
const FOLLOWEES = 200; // people you follow, for the read-time merge

function human(n: number): string {
  if (n < 1e3) return Math.round(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(n < 1e4 ? 1 : 0).replace(/\.0$/, "") + "K";
  return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
}

export default function NewsFeed() {
  const [model, setModel] = useState<Model>("write");
  const [exp, setExp] = useState(2.3); // log10 followers, ~200
  const [run, setRun] = useState(0); // bump to replay the fan-out animation
  const followers = Math.round(Math.pow(10, exp));

  // cost model (in "cache writes" / "feed reads merged")
  const postCost = model === "write" ? followers : 1;
  const readCost = model === "write" ? 1 : FOLLOWEES;
  const celebrity = followers > 50_000;

  const fanCount = Math.min(followers, 12);

  return (
    <div className="flex flex-col gap-8">
      <Note>
        When you post, how does it reach your followers&apos; feeds? Two answers,
        opposite trade-offs. <strong>Fan-out on write</strong> pushes the post
        into every follower&apos;s feed the moment you publish.{" "}
        <strong>Fan-out on read</strong> writes nothing now and merges posts from
        everyone you follow when you open the app.
      </Note>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="fan-out model"
          value={model}
          onChange={(v) => setModel(v as Model)}
          options={[
            { value: "write", label: "On write (push)" },
            { value: "read", label: "On read (pull)" },
          ]}
        />
        <ActionButton onClick={() => setRun((x) => x + 1)}>
          {model === "write" ? "▶ Publish post" : "▶ Open feed"}
        </ActionButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,300px)]">
        {/* diagram */}
        <Panel tone="stone" className="flex flex-col items-center justify-center gap-5 p-8">
          {model === "write" ? (
            <>
              <div className="rounded-[12px] bg-[var(--primary)] px-5 py-3 text-[14px] font-medium text-white">poster publishes</div>
              <div className="font-mono text-[11px] text-[var(--stone-text)]">↓ push into {human(followers)} feed caches now</div>
              <div className="flex max-w-[320px] flex-wrap justify-center gap-2">
                {Array.from({ length: fanCount }).map((_, i) => (
                  <div key={`${run}-${i}`} className="lab-pop flex h-9 w-9 items-center justify-center rounded-[8px] border border-[rgba(73,79,223,0.3)] bg-[rgba(73,79,223,0.08)] text-[10px] text-[var(--primary)]" style={{ animationDelay: `${i * 55}ms` }}>
                    ✓
                  </div>
                ))}
                {followers > fanCount && (
                  <div className="flex h-9 items-center px-2 font-mono text-[12px] text-[var(--primary)]">+{human(followers - fanCount)}</div>
                )}
              </div>
              <div className="rounded-[10px] border border-[var(--hairline-light)] bg-white px-4 py-2 text-[13px] text-[var(--ink)]">reader opens app → feed already built ⚡</div>
            </>
          ) : (
            <>
              <div className="rounded-[10px] border border-[var(--hairline-light)] bg-white px-4 py-2 text-[13px] text-[var(--ink)]">poster publishes → 1 write</div>
              <div className="font-mono text-[11px] text-[var(--stone-text)]">↓ nothing pushed</div>
              <div className="rounded-[12px] bg-[var(--accent-teal)] px-5 py-3 text-[14px] font-medium text-white">reader opens app</div>
              <div className="font-mono text-[11px] text-[var(--stone-text)]">↑ merge latest from {FOLLOWEES} followees on read</div>
              <div className="flex max-w-[320px] flex-wrap justify-center gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`${run}-${i}`} className="lab-pop h-9 w-9 rounded-[8px] border border-[rgba(0,168,126,0.3)] bg-[rgba(0,168,126,0.08)]" style={{ animationDelay: `${i * 55}ms` }} />
                ))}
                <div className="flex h-9 items-center px-2 font-mono text-[12px] text-[var(--accent-teal)]">+{FOLLOWEES - 12}</div>
              </div>
            </>
          )}
        </Panel>

        {/* costs */}
        <div className="flex flex-col gap-5">
          <Panel className="p-6">
            <Slider label="followers" min={1} max={6.7} step={0.05} value={exp} onChange={setExp} display={human(followers)} />
          </Panel>
          <Panel tone="stone" className="flex flex-col gap-4 p-6">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="mono-label text-[var(--mute)]">work at post time</span>
                <span className="font-mono text-[14px] font-medium" style={{ color: postCost > 1000 ? "var(--accent-danger)" : "var(--ink)" }}>{human(postCost)} writes</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--hairline-light)]">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (Math.log10(postCost + 1) / 7) * 100)}%`, background: postCost > 1000 ? "var(--accent-danger)" : "var(--primary)" }} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="mono-label text-[var(--mute)]">work at read time</span>
                <span className="font-mono text-[14px] font-medium text-[var(--ink)]">{human(readCost)} merged</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--hairline-light)]">
                <div className="h-full rounded-full bg-[var(--accent-teal)] transition-all" style={{ width: `${Math.min(100, (Math.log10(readCost + 1) / 7) * 100)}%` }} />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Callout label="// the celebrity problem" tone={celebrity && model === "write" ? "warn" : "key"}>
        {model === "write" ? (
          <>
            Push makes reads instant - perfect for normal users. But a celebrity
            with {human(followers)} followers triggers {human(followers)} cache
            writes on a <em>single</em> post (the <strong>hotkey problem</strong>).
            {celebrity && " That's the spike melting your fan-out workers right now."}
          </>
        ) : (
          <>
            Pull writes nothing on post, so celebrities cost nothing extra - but
            every reader pays a {FOLLOWEES}-way merge on each feed load, making
            reads slow for everyone.
          </>
        )}{" "}
        Real systems go <strong>hybrid</strong>: push for ordinary users, pull for
        celebrities, so neither path blows up.
      </Callout>
    </div>
  );
}
