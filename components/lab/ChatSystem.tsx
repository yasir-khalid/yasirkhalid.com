"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel, Toggle } from "@/components/lab/ui";

// =====================================================================
// Design a chat system (Alex Xu vol.1, ch.12). A message rides a persistent
// WebSocket: sender -> chat server -> receiver (if online) or store + push.
// =====================================================================

type Phase = "idle" | "toServer" | "toReceiver" | "stored";
type LogLine = { id: number; text: string; delivered: boolean };

const SAMPLE = ["hey, you around?", "ship it 🚀", "lunch?", "PR is green ✅", "🎉🎉🎉"];

export default function ChatSystem() {
  const [online, setOnline] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState("");
  const [log, setLog] = useState<LogLine[]>([]);
  const idRef = useRef(0);
  const sampleRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function send() {
    if (phase !== "idle") return;
    const body = text.trim() || SAMPLE[sampleRef.current++ % SAMPLE.length];
    setText("");
    setPhase("toServer");
    timers.current.push(
      setTimeout(() => setPhase("toReceiver"), 700),
      setTimeout(() => {
        const delivered = online;
        setLog((l) => [{ id: idRef.current++, text: body, delivered }, ...l].slice(0, 5));
        setPhase(delivered ? "idle" : "stored");
        if (!delivered) timers.current.push(setTimeout(() => setPhase("idle"), 1100));
      }, 1400)
    );
  }

  // dot position along A -> server -> B
  const dotLeft = phase === "toServer" ? "8%" : phase === "toReceiver" || phase === "stored" ? "50%" : "8%";
  const dotVisible = phase === "toServer" || phase === "toReceiver";

  return (
    <div className="flex flex-col gap-8">
      <Note>
        Chat needs the server to <strong>push</strong> to the client the instant a
        message arrives - so the connection is a persistent, bidirectional{" "}
        <strong>WebSocket</strong>, not request/response. The sender&apos;s message
        hits a stateful chat server, which relays it down the receiver&apos;s open
        socket. If they&apos;re offline, it&apos;s stored and a push notification
        is sent instead.
      </Note>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="message from Ann…"
            className="w-56 rounded-[10px] border border-[var(--hairline)] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[var(--ink)]"
          />
          <ActionButton onClick={send} disabled={phase !== "idle"}>Send →</ActionButton>
        </div>
        <Toggle label={online ? "Ben is online" : "Ben is offline"} checked={online} onChange={setOnline} />
      </div>

      {/* topology */}
      <Panel tone="stone" className="p-6 sm:p-8">
        <div className="relative flex items-center justify-between">
          {/* connection lines */}
          <div className="absolute left-[12%] right-[12%] top-1/2 h-[2px] -translate-y-1/2 bg-[var(--hairline-strong)]" />
          {/* travelling dot */}
          {dotVisible && (
            <div
              className="absolute top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[var(--primary)] transition-all duration-700"
              style={{ left: dotLeft }}
            />
          )}

          {/* Ann */}
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="grid h-16 w-16 place-items-center rounded-[14px] bg-[var(--primary)] text-[15px] font-semibold text-white">Ann</div>
            <span className="font-mono text-[10px] text-[var(--accent-teal)]">ws ● open</span>
          </div>

          {/* chat server */}
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="grid h-16 w-20 place-items-center rounded-[14px] border border-[var(--hairline-strong)] bg-white text-[12px] font-medium text-[var(--ink)]">chat<br />server</div>
            <span className="font-mono text-[10px] text-[var(--stone-text)]">stateful</span>
          </div>

          {/* Ben */}
          <div className="z-10 flex flex-col items-center gap-2">
            <div className={`grid h-16 w-16 place-items-center rounded-[14px] text-[15px] font-semibold text-white ${online ? "bg-[var(--accent-teal)]" : "bg-[var(--stone-text)]"}`}>Ben</div>
            <span className={`font-mono text-[10px] ${online ? "text-[var(--accent-teal)]" : "text-[var(--accent-danger)]"}`}>
              ws {online ? "● open" : "○ closed"}
            </span>
          </div>
        </div>

        {/* status line */}
        <p className="mt-6 text-center font-mono text-[12px] text-[var(--charcoal)]">
          {phase === "idle" && "idle - send a message"}
          {phase === "toServer" && "Ann → chat server (over WebSocket)"}
          {phase === "toReceiver" && (online ? "chat server → Ben's open socket" : "Ben offline - storing message")}
          {phase === "stored" && "📥 stored in message queue + 🔔 push notification sent"}
        </p>
      </Panel>

      {/* log */}
      <Panel className="p-5">
        <p className="mono-label text-[var(--mute)]">message log</p>
        <div className="mt-3 flex flex-col gap-2">
          {log.length === 0 && <span className="font-mono text-[12px] text-[var(--stone-text)]">no messages yet</span>}
          {log.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-[14px] text-[var(--ink)]">{l.text}</span>
              <span className={`font-mono text-[11px] ${l.delivered ? "text-[var(--accent-teal)]" : "text-[var(--accent-warning)]"}`}>
                {l.delivered ? "✓ delivered" : "⧗ queued + pushed"}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Callout label="// why the chat server is stateful" tone="key">
        Most of a chat app - login, profiles, search - is ordinary stateless
        HTTP. The one stateful piece is the chat server, because it{" "}
        <strong>holds the open WebSocket</strong> for each connected client. A{" "}
        <strong>service discovery</strong> layer hands a client the right server
        to connect to, and a presence system tracks who&apos;s online via
        heartbeats. At 1M concurrent users and ~10KB per connection, that&apos;s
        only ~10GB of RAM - the connection count, not storage, is the limit.
      </Callout>

      <Note>
        Flip Ben offline and send: the server can&apos;t reach his socket, so it
        falls back to <strong>store-and-push</strong> - persist the message and
        ask the notification system (chapter 10) to wake his device. He&apos;ll
        pull it on reconnect.
      </Note>
    </div>
  );
}
