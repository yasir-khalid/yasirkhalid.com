"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profile, announcement } from "@/lib/content";

const links = [
  { href: "#work", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "/lab", label: "The Lab" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [barOpen, setBarOpen] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) setBarOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      {barOpen && (
        <div className="flex h-9 items-center justify-center bg-black px-4 text-center text-[13px] text-white">
          <p className="truncate">
            {announcement.text}{" "}
            <a
              href={announcement.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Learn more
            </a>
          </p>
          <button
            aria-label="Dismiss"
            onClick={() => setBarOpen(false)}
            className="absolute right-4 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <header className="border-b border-[var(--border-light)] bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-[6px] bg-[var(--near-black)] text-[12px] font-medium text-white">
              YK
            </span>
            <span className="display text-[16px] tracking-tight">
              Yasir Khalid
            </span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((l) =>
              l.href.startsWith("/") ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[14px] text-[var(--ink)] transition-colors hover:text-[var(--blue)]"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[14px] text-[var(--ink)] transition-colors hover:text-[var(--blue)]"
                >
                  {l.label}
                </a>
              )
            )}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-text !text-[14px]"
            >
              GitHub
            </a>
            <a href="#contact" className="btn btn-primary !px-5 !py-2 !text-[14px]">
              Get in touch
            </a>
          </div>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-[6px] border border-[var(--hairline)] md:hidden"
          >
            <span className="block h-[1.5px] w-4 bg-[var(--ink)]" />
            <span className="block h-[1.5px] w-4 bg-[var(--ink)]" />
          </button>
        </nav>

        {open && (
          <div className="border-t border-[var(--border-light)] bg-white px-5 py-3 md:hidden">
            <div className="flex flex-col">
              {links.map((l) =>
                l.href.startsWith("/") ? (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="px-1 py-2.5 text-[15px] text-[var(--ink)]"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="px-1 py-2.5 text-[15px] text-[var(--ink)]"
                  >
                    {l.label}
                  </a>
                )
              )}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="btn btn-primary mt-2 !text-[14px]"
              >
                Get in touch
              </a>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
