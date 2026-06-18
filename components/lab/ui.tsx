"use client";

// Shared, theme-consistent controls for lab explainers.
// Coral accent, hairline borders, mono labels — matches globals.css tokens.

export function Panel({
  children,
  className = "",
  tone = "white",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "white" | "stone" | "ink";
}) {
  const tones = {
    white: "bg-white ring-1 ring-[var(--card-border)]",
    stone: "bg-[var(--stone)]",
    ink: "bg-[var(--near-black)] text-white ring-1 ring-white/10",
  };
  return (
    <div className={`rounded-[16px] ${tones[tone]} ${className}`}>{children}</div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <p className="mono-label mb-2 text-[var(--slate)]">{label}</p>
      )}
      <div className="inline-flex flex-wrap gap-1 rounded-[10px] border border-[var(--hairline)] bg-[var(--stone)] p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[var(--near-black)] text-white"
                  : "text-[var(--slate)] hover:text-[var(--ink)]"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  display,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="mono-label text-[var(--slate)]">{label}</span>
        <span className="font-mono text-[14px] font-medium text-[var(--ink)]">
          {display ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lab-range w-full"
      />
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn !min-h-0 !px-5 !py-2.5 !text-[14px] ${
        variant === "primary" ? "btn-dark" : ""
      } ${
        variant === "ghost"
          ? "border border-[var(--hairline-strong)] text-[var(--ink)] hover:bg-[var(--surface-soft)]"
          : ""
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="border-t border-[var(--hairline)] pt-3">
      <p className="mono-label text-[var(--muted)]">{label}</p>
      <p
        className={`display mt-1.5 text-[clamp(1.5rem,3.5vw,2.2rem)] ${
          accent ? "text-[var(--coral)]" : "text-[var(--ink)]"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-[13px] text-[var(--slate)]">{sub}</p>}
    </div>
  );
}

// A small explanatory callout used between interactive blocks.
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-[var(--coral)] pl-4 text-[15px] leading-[1.6] text-[var(--slate)]">
      {children}
    </p>
  );
}
