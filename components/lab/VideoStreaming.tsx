"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, Callout, Note, Panel, Slider } from "@/components/lab/ui";

// =====================================================================
// Design a video platform (Alex Xu vol.1, ch.14). Two flows: a transcoding
// pipeline (a DAG) on upload, and adaptive-bitrate streaming from a CDN.
// =====================================================================

const STAGES = [
  { key: "upload", label: "Upload", sub: "to origin store", end: 14 },
  { key: "inspect", label: "Inspect", sub: "validate / probe", end: 28 },
  { key: "split", label: "Split", sub: "video · audio · meta", end: 42 },
  { key: "encode", label: "Transcode", sub: "DAG · parallel", end: 84 },
  { key: "package", label: "Package", sub: "DASH / HLS", end: 94 },
  { key: "cdn", label: "CDN", sub: "edge replicas", end: 100 },
];
const TIERS = [
  { name: "240p", mbps: 0.4 },
  { name: "360p", mbps: 0.8 },
  { name: "480p", mbps: 1.5 },
  { name: "720p", mbps: 3 },
  { name: "1080p", mbps: 6 },
];

export default function VideoStreaming() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [bandwidth, setBandwidth] = useState(4); // Mbps
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setRunning(false); return 100; }
        return Math.min(100, p + 2);
      });
    }, 90);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  function start() {
    setProgress(0);
    setRunning(true);
  }

  function stageState(end: number, prevEnd: number): "done" | "active" | "todo" {
    if (progress >= end) return "done";
    if (progress >= prevEnd) return "active";
    return "todo";
  }

  // adaptive bitrate: pick the best tier that fits the bandwidth
  const playable = TIERS.filter((t) => t.mbps <= bandwidth);
  const selected = playable.length ? playable[playable.length - 1] : TIERS[0];

  return (
    <div className="flex flex-col gap-8">
      <Note>
        A video platform is really two systems. On <strong>upload</strong>, the
        raw file is transcoded into many resolutions through a pipeline of
        parallel tasks (a DAG). On <strong>playback</strong>, the player streams
        from the nearest CDN edge and switches resolution on the fly to match your
        bandwidth - <strong>adaptive bitrate</strong>.
      </Note>

      {/* transcode pipeline */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="mono-label text-[var(--charcoal)]">// upload + transcode</p>
          <ActionButton onClick={start} disabled={running}>{progress > 0 && progress < 100 ? "transcoding…" : "▶ Upload & transcode"}</ActionButton>
        </div>
        <Panel tone="stone" className="p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
            {STAGES.map((s, i) => {
              const st = stageState(s.end, i === 0 ? 0 : STAGES[i - 1].end);
              const bg = st === "done" ? "var(--accent-teal)" : st === "active" ? "var(--primary)" : "#fff";
              const fg = st === "todo" ? "var(--mute)" : "#fff";
              return (
                <div key={s.key} className={`flex flex-col gap-1 rounded-[4px] border p-3 transition-colors ${st === "active" ? "lab-pop" : ""}`}
                  style={{ background: bg, borderColor: st === "todo" ? "var(--hairline-light)" : "transparent" }}>
                  <span className="text-[13px] font-medium" style={{ color: fg }}>{s.label}</span>
                  <span className="font-mono text-[9px]" style={{ color: st === "todo" ? "var(--stone-text)" : "rgba(255,255,255,0.8)" }}>{s.sub}</span>
                </div>
              );
            })}
          </div>
          {/* encode fan-out */}
          <div className="mt-4">
            <p className="font-mono text-[10px] text-[var(--stone-text)]">transcode DAG fans into:</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...TIERS.map((t) => t.name), "thumbnail", "watermark"].map((t) => (
                <span key={t} className={`rounded-[4px] border px-2.5 py-1 font-mono text-[11px] transition-colors ${progress >= 84 ? "border-transparent bg-[var(--accent-teal)] text-white" : progress >= 42 ? "border-[rgba(73,79,223,0.3)] bg-[rgba(73,79,223,0.08)] text-[var(--primary)]" : "border-[var(--hairline-light)] text-[var(--stone-text)]"}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--hairline-light)]">
            <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </Panel>
      </div>

      {/* ABR player */}
      <div className="flex flex-col gap-4">
        <p className="mono-label text-[var(--charcoal)]">// playback · adaptive bitrate</p>
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,300px)]">
          <Panel tone="ink" className="flex flex-col items-center justify-center gap-3 p-10">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white/10 text-white">▶</div>
            <p className="display text-[2rem] text-white">{selected.name}</p>
            <p className="font-mono text-[12px] text-white/55">streaming {selected.mbps} Mbps from nearest CDN edge</p>
          </Panel>
          <div className="flex flex-col gap-4">
            <Panel className="p-6">
              <Slider label="your bandwidth" min={0.3} max={12} step={0.1} value={bandwidth} onChange={setBandwidth} display={`${bandwidth.toFixed(1)} Mbps`} />
            </Panel>
            <Panel tone="stone" className="flex flex-col gap-1.5 p-5">
              {TIERS.map((t) => {
                const fits = t.mbps <= bandwidth;
                const isSel = t.name === selected.name;
                return (
                  <div key={t.name} className="flex items-center justify-between">
                    <span className={`text-[13px] ${isSel ? "font-semibold text-[var(--primary)]" : fits ? "text-[var(--ink)]" : "text-[var(--stone-text)] line-through"}`}>{t.name}</span>
                    <span className="font-mono text-[11px] text-[var(--stone-text)]">{t.mbps} Mbps {isSel ? "← playing" : ""}</span>
                  </div>
                );
              })}
            </Panel>
          </div>
        </div>
      </div>

      <Callout label="// why transcode into so many versions" tone="key">
        Raw video is huge and not every device decodes every format. Transcoding
        re-encodes the upload into a ladder of <strong>resolutions and
        bitrates</strong> ahead of time. At play time the client picks the highest
        rung that fits the current network - drag bandwidth down and watch it drop
        to 240p to avoid buffering, then climb back to 1080p when it recovers.
      </Callout>

      <Note>
        The transcoding DAG (Facebook&apos;s streaming engine works this way) lets
        each task - inspect, encode, thumbnail, watermark - run in parallel on a
        fleet of workers, then everything lands on the CDN so playback starts from
        an edge server milliseconds away.
      </Note>
    </div>
  );
}
