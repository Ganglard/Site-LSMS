"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "../reveal";
import { emblemFlight } from "../../emblem-flight";

const DIVISIONS = [
  { slug: "medical-academy", name: "Medical Academy", logo: "/lsms/divisions/medical-academy.png" },
  { slug: "surgery", name: "Surgery Service", logo: "/lsms/divisions/surgery.png" },
  { slug: "clinical-laboratory", name: "Clinical Laboratory Service", logo: "/lsms/divisions/clinical-laboratory.png" },
  { slug: "psychological", name: "Psychological Service", logo: "/lsms/divisions/psychological.png" },
  { slug: "obstetricians", name: "Obstetricians Services", logo: "/lsms/divisions/obstetricians.png" },
  { slug: "mortuary", name: "Mortuary Service", logo: "/lsms/divisions/mortuary.png" },
];

const AVANTAGES = [
  { n: "01", t: "Equipment complet", d: "Ambulances, trousses de premier secours et materiel de reanimation fournis en dotation." },
  { n: "02", t: "Perspectives d'avenir", d: "Evoluez vers les unites specialisees : urgences, chirurgie, academie." },
  { n: "03", t: "Remboursement des frais", d: "Carburant, reparations et frais de mission pris en charge par le service." },
  { n: "04", t: "Remuneration", d: "Salaire competitif et primes de garde a la hauteur de votre engagement." },
];

const FAQ_ITEMS = [
  {
    q: "1. Comment rejoindre le LSMS ?",
    a: "Envoyez votre candidature via le bouton « Postuler ». Une fois accepte, vous serez mis en attente jusqu'a ce qu'une date de session de formation vous soit communiquee.",
  },
  { q: "2. Ou se passent les recrutements ?", a: "A l'Academie Medicale de Central Medical (Pillbox Hill)." },
  { q: "3. Combien de temps avant une reponse ?", a: "Vous recevrez une reponse dans les 48h suivant l'envoi de votre candidature." },
  { q: "4. Faut-il de l'experience en roleplay medical ?", a: "Non, l'academie part des bases : protocoles de soins, triage, communication radio. Ce qui compte, c'est de savoir ecouter une consigne et de rester dans votre personnage." },
  { q: "5. J'ai ete refuse, quand puis-je repostuler ?", a: "Vous pouvez repostuler immediatement apres un refus." },
];

export default function AccueilClient() {
  const [openFaq, setOpenFaq] = useState<number>(0);

  // Atterrissage de l'embleme volant (vol lance par /intro, calque persistant)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("fromIntro") !== "1") return;
    const heroEmblem = document.querySelector("[data-hero-emblem] img") as HTMLImageElement | null;
    if (!heroEmblem) return;
    if (!emblemFlight.isActive()) {
      window.history.replaceState({}, "", "/accueil");
      return;
    }
    heroEmblem.style.opacity = "0";
    requestAnimationFrame(() => requestAnimationFrame(async () => {
      const r = heroEmblem.getBoundingClientRect();
      // Le logo de la video est plus grand que celui du hero : le vol reduit
      // l'echelle progressivement pour finir pile a la taille du hero (crossfade invisible).
      await emblemFlight.flyTo({ x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width, duration: 900 });
      heroEmblem.style.transition = "opacity 0.45s ease";
      heroEmblem.style.opacity = "1";
      emblemFlight.settle();
      window.history.replaceState({}, "", "/accueil");
    }));
  }, []);

  // Double pulsation : couches injectees (hors re-render React)
  useEffect(() => {
    const mk = (cls: string) => {
      const d = document.createElement("div");
      d.className = cls;
      document.body.appendChild(d);
      return d;
    };
    const red = mk("lsms-pulse-red");
    const teal = mk("lsms-pulse-teal");
    return () => {
      red.remove();
      teal.remove();
    };
  }, []);

  return (
    <div className="lsms-root" id="top">
      {/* ORBES */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[180px] -top-[260px] h-[720px] w-[720px] rounded-full bg-[rgba(59,110,220,0.14)] blur-[90px]" />
        <div className="absolute -right-[220px] top-[20%] h-[600px] w-[600px] rounded-full bg-[rgba(147,197,253,0.08)] blur-[90px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[520px] w-[520px] rounded-full bg-[rgba(30,58,138,0.10)] blur-[90px]" />
      </div>

      <div className="relative z-[1] mx-auto max-w-[1240px] px-5 sm:px-[30px]">
        {/* HERO */}
        <section className="pb-[80px] pt-[110px] text-center">
          <h1
            className="mb-2 text-balance font-bold leading-[0.98] tracking-[-0.03em]"
            style={{ fontSize: "clamp(52px, 8.5vw, 108px)" }}
          >
            Los Santos
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(112deg,#EAF3FF 0%,#BFDCF5 24%,#6FA0E8 52%,#3B6EDC 76%,#93C5FD 100%)",
              }}
            >
              Medical Services
            </span>
          </h1>
          <p className="mx-auto mb-11 mt-[26px] max-w-[640px] text-[21px] font-light leading-[1.6] text-[rgba(235,245,242,0.72)]">
            Soigner est un art. Servir est un honneur.
          </p>
          <div className="mb-[70px] flex flex-wrap justify-center gap-4">
            <Link href="/candidature" className="lsms-cta">
              Nous rejoindre
            </Link>
            <a href="#faq" className="lsms-pill !px-[36px] !py-[17px] !text-[15px] font-medium">
              Voir la FAQ
            </a>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="lsms-spin absolute h-[420px] w-[420px] rounded-full blur-[46px]" style={{ background: "conic-gradient(from 0deg, rgba(59,110,220,0), rgba(59,110,220,0.18), rgba(147,197,253,0.14), rgba(59,110,220,0))" }} />
            <div className="absolute h-[360px] w-[360px] rounded-full border border-white/[0.12]" />
            <div className="lsms-spin-slow absolute h-[280px] w-[280px] rounded-full border border-dashed border-[rgba(147,197,253,0.28)]" />
            <div data-hero-emblem style={{ display: "inline-block" }}>
              <Image
                src="/lsms/emblem-hd.png"
                alt="Embleme du Los Santos Medical Services"
                width={240}
                height={240}
                priority
                className="lsms-float relative z-[2] h-auto w-[240px] drop-shadow-[0_30px_50px_rgba(0,0,0,0.75)]"
              />
            </div>
          </div>
        </section>

        {/* DIVISIONS */}
        <section id="divisions" className="pb-[100px] pt-[60px]">
          <Reveal className="mb-14 text-center">
            <span className="lsms-pill !text-[11.5px] font-medium uppercase tracking-[0.26em] text-[var(--lsms-teal-light)]">
              Nos divisions
            </span>
            <h2 className="mt-[22px] font-bold tracking-[-0.02em]" style={{ fontSize: "clamp(38px,5vw,62px)", fontFamily: "var(--font-saira), sans-serif" }}>
              Nos divisions recrutent
            </h2>
          </Reveal>
          <div className="grid items-stretch gap-5 [grid-auto-rows:1fr] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {DIVISIONS.map((d) => (
              <Reveal key={d.slug} className="h-full">
                <Link
                  href={`/divisions/${d.slug}`}
                  className="lsms-glass lsms-card flex h-full w-full flex-col items-center justify-center rounded-[30px] px-7 py-[34px] text-center transition-[transform,border-color,box-shadow] duration-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.logo} alt={d.name} className="mb-[18px] inline-block h-24 w-24 object-contain" />
                  <h3 className="m-0 text-[19px] font-semibold">{d.name}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* AVANTAGES */}
        <section id="avantages" className="pb-[100px] pt-[60px]">
          <Reveal className="mb-14 text-center">
            <span className="lsms-pill !text-[11.5px] font-medium uppercase tracking-[0.26em] text-[var(--lsms-teal-light)]">
              Les avantages
            </span>
            <h2 className="mx-auto mt-[22px] max-w-[800px] text-balance font-bold tracking-[-0.02em]" style={{ fontSize: "clamp(34px,4.6vw,58px)" }}>
              Votre engagement merite une vraie reconnaissance
            </h2>
            <p className="mx-auto mt-[18px] max-w-[560px] text-[17px] font-light text-[rgba(235,245,242,0.65)]">
              Le LSMS offre plus qu&apos;un metier : une mission claire, de la stabilite et de vraies perspectives d&apos;avenir.
            </p>
          </Reveal>
          <div className="grid items-stretch gap-5 [grid-auto-rows:1fr] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {AVANTAGES.map((a) => (
              <Reveal key={a.n} className="h-full">
                <div className="lsms-glass h-full w-full rounded-[30px] px-8 py-9">
                  <span className="lsms-pill !mb-[22px] inline-flex !text-[15px] font-bold !text-white" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
                    {a.n}
                  </span>
                  <h3 className="mb-2.5 mt-5 text-[21px] font-semibold">{a.t}</h3>
                  <p className="m-0 text-[15px] leading-[1.6] text-[rgba(235,245,242,0.6)]">{a.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="pb-[100px] pt-[60px]">
          <Reveal className="mb-[50px] text-center">
            <span className="lsms-pill !text-[11.5px] font-medium uppercase tracking-[0.26em] text-[var(--lsms-teal-light)]">
              FAQ
            </span>
            <h2 className="mt-[22px] font-bold tracking-[-0.02em]" style={{ fontSize: "clamp(34px,4.6vw,58px)" }}>
              Questions frequentes
            </h2>
          </Reveal>
          <div className="grid gap-3">
            {FAQ_ITEMS.map((f, i) => (
              <Reveal key={i}>
                <div className="lsms-glass rounded-[24px] px-7 py-6">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-btn-${i}`}
                    className="flex w-full cursor-pointer select-none items-center justify-between gap-4 bg-transparent text-left"
                  >
                    <span className="text-[17px] font-semibold">{f.q}</span>
                    <svg
                      className="shrink-0 transition-transform duration-300"
                      style={{ transform: openFaq === i ? "rotate(180deg)" : "none" }}
                      width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" opacity="0.7"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    className="grid overflow-hidden transition-all duration-300"
                    style={{
                      gridTemplateRows: openFaq === i ? "1fr" : "0fr",
                      opacity: openFaq === i ? 1 : 0,
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="mb-0 pt-3.5 text-[15px] leading-[1.65] text-[rgba(235,245,242,0.68)]">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
