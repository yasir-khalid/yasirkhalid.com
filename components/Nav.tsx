"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profile, announcement } from "@/lib/content";
import { GitHubIcon, XIcon } from "@/components/icons";

const links = [
  { href: "/#work", label: "Experience" },
  { href: "/#projects", label: "Builds" },
  { href: "/lab", label: "The Lab" },
  { href: "/resume", label: "Resume" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [barOpen, setBarOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement bar - scrolls away naturally */}
      {barOpen && (
        <div className="relative flex h-9 items-center justify-center border-b border-[var(--hairline-light)] bg-[var(--surface-soft)] px-4 text-center text-[13px] text-[var(--mute)]">
          <p className="truncate">
            {announcement.text}{" "}
            <a
              href={announcement.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ink)] underline underline-offset-2"
            >
              Learn more
            </a>
          </p>
          <button
            aria-label="Dismiss"
            onClick={() => setBarOpen(false)}
            className="absolute right-4 text-[var(--stone-text)] hover:text-[var(--ink)]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Nav - cream throughout, frosted on scroll for a little depth */}
      <header
        className={`sticky top-0 z-50 transition-all duration-[330ms] ${
          scrolled
            ? "border-b border-[var(--hairline-light)] bg-[var(--canvas-light)]/90 backdrop-blur-md"
            : "bg-[var(--canvas-light)]"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1040px] items-center justify-between px-5 sm:px-8">
          {/* Wordmark */}
          <Link href="/#top" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-[6px] bg-[var(--primary)] text-[12px] font-semibold text-[var(--ink)]">
              YK
            </span>
            <span className="display text-[16px] text-[var(--ink)]">
              Yasir Khalid
            </span>
          </Link>

          {/* Center nav links */}
          <div className="hidden items-center gap-7 md:flex">
            {links.map((l) =>
              l.href.startsWith("/") ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[14px] font-medium text-[var(--body)] transition-colors duration-[330ms] hover:text-[var(--ink)]"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[14px] font-medium text-[var(--body)] transition-colors duration-[330ms] hover:text-[var(--ink)]"
                >
                  {l.label}
                </a>
              )
            )}
          </div>

          {/* Right icons + CTA */}
          <div className="hidden items-center gap-5 md:flex">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-[var(--mute)] transition-colors duration-[330ms] hover:text-[var(--ink)]"
            >
              <GitHubIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={profile.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="text-[var(--mute)] transition-colors duration-[330ms] hover:text-[var(--ink)]"
            >
              <XIcon className="h-[16px] w-[16px]" />
            </a>
            <Link
              href="/#contact"
              className="btn btn-primary !min-h-0 !px-5 !py-2 !text-[13px]"
            >
              Get in touch
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-[6px] border border-[var(--hairline-light)] transition-colors duration-[330ms] md:hidden"
          >
            <span className="block h-[1.5px] w-4 bg-[var(--ink)] transition-colors duration-[330ms]" />
            <span className="block h-[1.5px] w-4 bg-[var(--ink)] transition-colors duration-[330ms]" />
          </button>
        </nav>

        {/* Mobile drawer */}
        {open && (
          <div className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)] px-5 py-3 md:hidden">
            <div className="flex flex-col">
              {links.map((l) =>
                l.href.startsWith("/") ? (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="px-1 py-2.5 text-[15px] font-medium text-[var(--body)]"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="px-1 py-2.5 text-[15px] font-medium text-[var(--body)]"
                  >
                    {l.label}
                  </a>
                )
              )}
              <div className="mt-3 flex items-center gap-5 px-1">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-[var(--mute)]"
                >
                  <GitHubIcon className="h-5 w-5" />
                </a>
                <a
                  href={profile.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="text-[var(--mute)]"
                >
                  <XIcon className="h-[18px] w-[18px]" />
                </a>
              </div>
              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className="btn btn-primary mt-4 !text-[14px]"
              >
                Get in touch
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
