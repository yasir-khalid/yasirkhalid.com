"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel } from "@/components/lab/ui";

// =====================================================================
// Design a notification system (Alex Xu vol.1, ch.10). One event fans out
// to push / SMS / email through queues and workers, with retries when a
// third-party provider flakes.
// =====================================================================

type Channel = "push" | "sms" | "email";
const CHANNELS: { key: Channel; label: string; provider: string; fail: number; color: string }[] = [
  { key: "push", label: "Push", provider: "APNs / FCM", fail: 0.15, color: "var(--primary)" },
  { key: "sms", label: "SMS", provider: "Twilio", fail: 0.3, color: "var(--accent-warning)" },
  { key: "email", label: "Email", provider: "Sendgrid", fail: 0.2, color: "var(--accent-teal)" },
];
const STAGES = ["queue", "worker", "provider", "sent"] as const;
const MAX_RETRY = 3;

type Msg = { id: number; ch: Channel; stage: number; attempts: number };

export default function NotificationSystem() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [delivered, setDelivered] = useState<Record<Channel, number>>({ push: 0, sms: 0, email: 0 });
  const [retries, setRetries] = useState(0);
  const [failed, setFailed] = useState(0);
  const [running, setRunning] = useState(true);
  const idRef = useRef(0);

  function trigger(count = 1) {
    const add: Msg[] = [];
    for (let e = 0; e < count; e++) {
      for (const c of CHANNELS) add.push({ id: idRef.current++, ch: c.key, stage: 0, attempts: 0 });
    }
    setMsgs((m) => [...m, ...add]);
  }

  useEffect(() => {
    if (!running) return;
    const h = setInterval(() => {
      setMsgs((prev) => {
        const nextMsgs: Msg[] = [];
        let dPush = 0, dSms = 0, dEmail = 0, rt = 0, fl = 0;
        for (const m of prev) {
          // at the provider stage, the third party may fail
          if (m.stage === 2) {
            const cfg = CHANNELS.find((c) => c.key === m.ch)!;
            if (Math.random() < cfg.fail) {
              if (m.attempts + 1 >= MAX_RETRY) { fl++; continue; }
              rt++;
              nextMsgs.push({ ...m, stage: 0, attempts: m.attempts + 1 }); // back to queue
              continue;
            }
          }
          if (m.stage >= 3) {
            if (m.ch === "push") dPush++; else if (m.ch === "sms") dSms++; else dEmail++;
            continue; // delivered, leave the pipeline
          }
          nextMsgs.push({ ...m, stage: m.stage + 1 });
        }
        if (dPush || dSms || dEmail) setDelivered((d) => ({ push: d.push + dPush, sms: d.sms + dSms, email: d.email + dEmail }));
        if (rt) setRetries((v) => v + rt);
        if (fl) setFailed((v) => v + fl);
        return nextMsgs;
      });
    }, 600);
    return () => clearInterval(h);
  }, [running]);

  function reset() {
    setMsgs([]); setDelivered({ push: 0, sms: 0, email: 0 }); setRetries(0); setFailed(0);
  }

  return (
    <div className="flex flex-col gap-8">
      <Note>
        One event - &ldquo;your order shipped&rdquo; - has to reach a user on
        whatever channel they&apos;ve enabled. A <strong>fan-out service</strong>{" "}
        drops a copy onto a queue per channel; <strong>workers</strong> pull from
        the queue and hand off to a third-party provider. Queues decouple the
        spike from the slow, flaky providers.
      </Note>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton onClick={() => trigger(1)}>Trigger event</ActionButton>
        <ActionButton variant="ghost" onClick={() => trigger(5)}>⚡ Storm ×5</ActionButton>
        <ActionButton variant="ghost" onClick={() => setRunning((r) => !r)}>{running ? "❚❚ Pause" : "▶ Play"}</ActionButton>
        <ActionButton variant="ghost" onClick={reset}>Reset</ActionButton>
      </div>

      {/* lanes */}
      <Panel tone="stone" className="flex flex-col gap-4 p-6">
        {/* header */}
        <div className="grid grid-cols-[88px_repeat(4,1fr)] gap-2">
          <span />
          {STAGES.map((s) => (
            <span key={s} className="text-center font-mono text-[10px] uppercase tracking-wide text-[var(--stone-text)]">{s}</span>
          ))}
        </div>
        {CHANNELS.map((c) => {
          const lane = msgs.filter((m) => m.ch === c.key);
          return (
            <div key={c.key} className="grid grid-cols-[88px_repeat(4,1fr)] items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-[var(--ink)]">{c.label}</span>
                <span className="font-mono text-[10px] text-[var(--stone-text)]">{c.provider}</span>
              </div>
              {STAGES.map((_, si) => {
                const here = lane.filter((m) => m.stage === si);
                return (
                  <div key={si} className="flex min-h-[40px] flex-wrap content-start items-start gap-1 rounded-[8px] border border-dashed border-[var(--hairline-light)] bg-white/60 p-1.5">
                    {here.map((m) => (
                      <span
                        key={m.id}
                        className="h-3 w-3 rounded-full"
                        style={{ background: c.color, opacity: m.attempts ? 0.5 : 1 }}
                        title={m.attempts ? `retry ${m.attempts}` : "first try"}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </Panel>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {CHANNELS.map((c) => (
          <div key={c.key} className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
            <p className="mono-label text-[10px]" style={{ color: c.color }}>{c.label} sent</p>
            <p className="display mt-1.5 text-[1.5rem] text-[var(--ink)]">{delivered[c.key]}</p>
          </div>
        ))}
        <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
          <p className="mono-label text-[10px] text-[var(--accent-warning)]">retried</p>
          <p className="display mt-1.5 text-[1.5rem] text-[var(--accent-warning)]">{retries}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--hairline-light)] bg-white p-4">
          <p className="mono-label text-[10px] text-[var(--accent-danger)]">dropped</p>
          <p className="display mt-1.5 text-[1.5rem] text-[var(--accent-danger)]">{failed}</p>
        </div>
      </div>

      <Callout label="// retries and dimmed dots" tone="key">
        Providers fail - Twilio here drops ~30% of attempts. A faded dot is a{" "}
        <strong>retry</strong>: the worker caught the failure and put the message
        back on the queue. After {MAX_RETRY} attempts it&apos;s moved to a{" "}
        <strong>dead-letter</strong> path (dropped). This is why notifications go
        through durable queues, not a direct synchronous call - a provider outage
        slows delivery instead of losing it.
      </Callout>

      <Note>
        A production system adds the pieces around this core: a contact-info store
        (device tokens, phone numbers, emails), per-user notification settings, a
        rate limiter so one event can&apos;t spam a user, and analytics on
        delivery, opens and opt-outs.
      </Note>
    </div>
  );
}
