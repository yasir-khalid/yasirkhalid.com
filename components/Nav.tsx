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

  const linkClass = scrolled
    ? "text-[#393C41] hover:text-[#171A20]"
    : "text-white/80 hover:text-white";
  const iconClass = scrolled
    ? "text-[#5C5E62] hover:text-[#171A20]"
    : "text-white/60 hover:text-white";

  return (
    <>
      {/* Announcement bar - scrolls away naturally */}
      {barOpen && (
        <div className="relative flex h-9 items-center justify-center bg-[#171A20] px-4 text-center text-[13px] text-white/70">
          <p className="truncate">
            {announcement.text}{" "}
            <a
              href={announcement.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-2"
            >
              Learn more
            </a>
          </p>
          <button
            aria-label="Dismiss"
            onClick={() => setBarOpen(false)}
            className="absolute right-4 text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating nav - transparent over hero, white/frosted after scroll */}
      <header
        className={`sticky top-0 z-50 transition-all duration-[330ms] ${
          scrolled
            ? "border-b border-[#EEEEEE] bg-white/90 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1040px] items-center justify-between px-5 sm:px-8">
          {/* Wordmark */}
          <Link href="/#top" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-[4px] bg-[var(--primary)] text-[12px] font-semibold text-white">
              YK
            </span>
            <span
              className={`display text-[16px] transition-colors duration-[330ms] ${
                scrolled ? "text-[#171A20]" : "text-white"
              }`}
            >
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
                  className={`text-[14px] font-medium transition-colors duration-[330ms] ${linkClass}`}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className={`text-[14px] font-medium transition-colors duration-[330ms] ${linkClass}`}
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
              className={`transition-colors duration-[330ms] ${iconClass}`}
            >
              <GitHubIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={profile.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className={`transition-colors duration-[330ms] ${iconClass}`}
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
            className={`flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-[4px] border transition-colors duration-[330ms] md:hidden ${
              scrolled ? "border-[#EEEEEE]" : "border-white/25"
            }`}
          >
            <span
              className={`block h-[1.5px] w-4 transition-colors duration-[330ms] ${
                scrolled ? "bg-[#171A20]" : "bg-white"
              }`}
            />
            <span
              className={`block h-[1.5px] w-4 transition-colors duration-[330ms] ${
                scrolled ? "bg-[#171A20]" : "bg-white"
              }`}
            />
          </button>
        </nav>

        {/* Mobile drawer */}
        {open && (
          <div
            className={`border-t px-5 py-3 md:hidden ${
              scrolled
                ? "border-[#EEEEEE] bg-white"
                : "border-white/10 bg-[#171A20]/96 backdrop-blur-md"
            }`}
          >
            <div className="flex flex-col">
              {links.map((l) =>
                l.href.startsWith("/") ? (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`px-1 py-2.5 text-[15px] font-medium ${
                      scrolled ? "text-[#393C41]" : "text-white/85"
                    }`}
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`px-1 py-2.5 text-[15px] font-medium ${
                      scrolled ? "text-[#393C41]" : "text-white/85"
                    }`}
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
                  className={scrolled ? "text-[#5C5E62]" : "text-white/60"}
                >
                  <GitHubIcon className="h-5 w-5" />
                </a>
                <a
                  href={profile.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className={scrolled ? "text-[#5C5E62]" : "text-white/60"}
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
