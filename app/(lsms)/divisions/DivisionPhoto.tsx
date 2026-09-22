"use client";

import { useState } from "react";

/**
 * Illustration d'une division.
 * Tente jpg -> png -> webp -> svg dans `public/lsms/divisions/illustrations/`
 * (nom = slug de la division, ex. `surgery.jpg`). Tant qu'aucune image n'est
 * fournie, affiche un placeholder aux couleurs de la division.
 */
const EXTENSIONS = ["jpg", "png", "webp", "svg"] as const;

export function DivisionPhoto({
  slug,
  accentRgb,
  name,
}: {
  slug: string;
  accentRgb: string;
  name: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const src = `/lsms/divisions/illustrations/${slug}.${EXTENSIONS[attempt]}`;
  const missing = attempt >= EXTENSIONS.length;

  if (missing) {
    return (
      <div
        className="lsms-glass relative flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[30px] px-8 py-12 text-center"
        style={{ borderStyle: "dashed", borderColor: `rgba(${accentRgb},0.45)` }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(420px 300px at 50% 30%, rgba(${accentRgb},0.18), transparent 70%)` }}
        />
        <svg width="46" height="46" viewBox="0 0 24 24" fill={`rgb(${accentRgb})`} aria-hidden className="relative">
          <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
        </svg>
        <span className="relative text-[13px] uppercase tracking-[0.2em] text-[rgba(235,245,242,0.55)]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
          Illustration de la division
        </span>
        <span className="relative text-[12.5px] text-[rgba(235,245,242,0.35)]">
          à venir
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-[30px] border border-white/[0.12]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Illustration de la division ${name}`}
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setAttempt((n) => n + 1)}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(180deg, transparent 45%, rgba(${accentRgb},0.22) 100%)` }}
      />
    </div>
  );
}