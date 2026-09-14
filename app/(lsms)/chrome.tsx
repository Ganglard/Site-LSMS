"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV = [
  { href: "/accueil", label: "Accueil" },
  { href: "/accueil#divisions", label: "Divisions" },
  { href: "/accueil#faq", label: "FAQ" },
];

/**
 * Header LSMS — pilule verre sticky.
 * Desktop : nav complete inline. Mobile (<640px) : burger -> panneau verre
 * deroulant ; embleme + Postuler restent visibles.
 */
export function LsmsHeader() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="lsms-glass sticky top-[14px] z-50 mx-auto flex w-[calc(100%-24px)] max-w-[1180px] items-center justify-between gap-3 rounded-full px-4 py-[10px] sm:px-[26px]"
    >
      <Link href="/accueil" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <Image
          src="/lsms/emblem.png"
          alt="Embleme LSMS"
          width={36}
          height={36}
          className="h-auto w-9 flex-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
        />
        <span
          className="truncate text-[15px] font-semibold tracking-[0.12em] text-[#F2F7F6]"
          style={{ fontFamily: "var(--font-barlow), sans-serif" }}
        >
          LOS SANTOS MEDICAL SERVICES
        </span>
      </Link>

      {/* Nav desktop (>=640px) */}
      <nav className="hidden items-center gap-0.5 sm:flex" aria-label="Navigation principale">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-full px-[18px] py-[10px] text-[13.5px] text-[rgba(235,245,242,0.75)] transition-colors duration-300 hover:bg-white/10 hover:text-white max-sm:flex max-sm:min-h-[44px] max-sm:items-center"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/candidature"
          className="lsms-cta ml-2 !px-[26px] !py-[12px] !text-[13.5px]"
        >
          Postuler
        </Link>
      </nav>

      {/* Mobile (<640px) : burger + Postuler compact */}
      <div className="flex items-center gap-2 sm:hidden">
        <Link
          href="/candidature"
          className="lsms-cta flex min-h-[44px] items-center !px-[18px] !text-[12.5px]"
        >
          Postuler
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="lsms-mobile-nav"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="lsms-pill flex h-11 w-11 flex-none cursor-pointer items-center justify-center !p-0"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <line x1="2" y1="4.5" x2="16" y2="4.5" style={{ transform: open ? 'translateY(4.5px) rotate(45deg)' : 'none', transition: 'transform 200ms var(--ease-out)', transformOrigin: 'center' }} />
            <line x1="2" y1="9" x2="16" y2="9" style={{ opacity: open ? 0 : 1, transition: 'opacity 150ms ease' }} />
            <line x1="2" y1="13.5" x2="16" y2="13.5" style={{ transform: open ? 'translateY(-4.5px) rotate(-45deg)' : 'none', transition: 'transform 200ms var(--ease-out)', transformOrigin: 'center' }} />
          </svg>
        </button>
      </div>

      {/* Panneau mobile : deroule SOUS la pilule */}
      <div
        id="lsms-mobile-nav"
        className="absolute left-0 right-0 top-[calc(100%+10px)] grid overflow-hidden rounded-[26px] sm:hidden"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transition: "grid-template-rows 0.3s var(--ease-out), opacity 0.25s ease",
        }}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <nav
            className="lsms-glass flex flex-col gap-1 rounded-[26px] p-3"
            aria-label="Navigation mobile"
          >
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="rounded-2xl px-5 py-3.5 text-[15px] text-[rgba(235,245,242,0.85)] transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export function LsmsFooter() {
  return (
    <footer className="relative z-[1] flex flex-wrap items-center justify-between gap-6 border-t border-white/[0.08] bg-[rgba(4,8,16,0.8)] px-6 py-[38px] sm:px-11">
      <div className="flex items-center gap-3.5">
        <Image
          src="/lsms/emblem.png"
          alt=""
          width={28}
          height={28}
          className="h-auto w-7 opacity-75"
        />
        <span className="text-[13px] text-[#7C948E]">
          Los Santos Medical Services · Univers roleplay fictif
        </span>
      </div>
      <div className="flex flex-wrap gap-[22px] text-[13px] uppercase tracking-[0.1em]">
        <Link href="/accueil" className="text-[#8AA39C] hover:text-[var(--lsms-teal-light)]">
          Accueil
        </Link>
        <Link href="/candidature" className="text-[#8AA39C] hover:text-[var(--lsms-teal-light)]">
          Candidature
        </Link>
      </div>
    </footer>
  );
}
