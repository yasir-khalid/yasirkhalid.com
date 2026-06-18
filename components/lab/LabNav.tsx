import Link from "next/link";

// Lightweight nav for lab pages (the homepage Nav uses in-page hash anchors
// that don't resolve off the homepage, so the lab gets its own bar).
export default function LabNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-white/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-[6px] bg-[var(--near-black)] text-[12px] font-medium text-white">
            YK
          </span>
          <span className="display text-[16px] tracking-tight">Yasir Khalid</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/lab"
            className="text-[14px] text-[var(--ink)] transition-colors hover:text-[var(--blue)]"
          >
            The Lab
          </Link>
          <Link
            href="/"
            className="text-[14px] text-[var(--slate)] transition-colors hover:text-[var(--blue)]"
          >
            ← Portfolio
          </Link>
        </div>
      </nav>
    </header>
  );
}
