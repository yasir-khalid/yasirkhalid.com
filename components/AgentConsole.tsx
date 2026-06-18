/* Abstract agent-console mockup — represents trace/eval semantics, no invented data. */
export default function AgentConsole() {
  const rows = [
    { name: "orchestrator", kind: "run", status: "ok", dur: "1.2s" },
    { name: "retrieve_context", kind: "tool · MCP", status: "ok", dur: "340ms" },
    { name: "policy_compare", kind: "sub-agent", status: "ok", dur: "880ms" },
    { name: "llm_as_judge", kind: "eval", status: "score 0.94", dur: "210ms" },
    { name: "guardrail_check", kind: "guardrail", status: "pass", dur: "60ms" },
  ];
  return (
    <div className="overflow-hidden rounded-[20px] bg-[var(--surface-elevated)] text-white ring-1 ring-white/10">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="mono-label ml-2 text-[11px] text-white/45">
          trace · multi-agent run
        </span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {rows.map((r, i) => (
          <div
            key={r.name}
            className="flex items-center gap-3 px-4 py-3"
            style={{ paddingLeft: `${16 + (i === 2 || i === 3 ? 18 : 0)}px` }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: r.kind.includes("eval") ? "#494fdf" : "#50e3c2" }}
            />
            <span className="font-mono text-[13px] text-white/90">{r.name}</span>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-white/45">
              {r.kind}
            </span>
            <span className="ml-auto font-mono text-[11px] text-white/35">
              {r.dur}
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[10px]"
              style={{
                background: r.status.includes("score")
                  ? "rgba(73,79,223,0.20)"
                  : "rgba(80,227,194,0.14)",
                color: r.status.includes("score") ? "#b9bcf4" : "#7ef0d8",
              }}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-4 py-3">
        <span className="mono-label text-[11px] text-white/40">
          opentelemetry → unified trace layer
        </span>
      </div>
    </div>
  );
}
