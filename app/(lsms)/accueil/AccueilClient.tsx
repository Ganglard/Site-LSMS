"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  { t: "Équipement complet", d: "Ambulances, trousses de premiers secours et matériel de réanimation fournis en dotation." },
  { t: "Perspectives d'évolution", d: "Accès aux unités spécialisées : urgences, chirurgie, académie." },
  { t: "Remboursement des frais", d: "Carburant, réparations et frais de mission pris en charge par le service." },
  { t: "Rémunération", d: "Salaire et primes de garde." },
];

const FAQ_ITEMS = [
  {
    q: "Comment rejoindre le LSMS ?",
    a: "Envoyez votre candidature via le bouton « Postuler ». Une fois acceptée, vous serez mis en attente jusqu'à ce qu'une date de session de formation vous soit communiquée.",
  },
  { q: "Où ont lieu les recrutements ?", a: "À l'Académie médicale de Central Medical (Pillbox Hill)." },
  { q: "Combien de temps faut-il pour obtenir une réponse ?", a: "Vous recevez une réponse dans les 48 h suivant l'envoi de votre candidature." },
  {
    q: "Faut-il de l'expérience en roleplay médical ?",
    a: "Non. L'académie part des bases : protocoles de soins, triage, communication radio. Il faut savoir suivre une consigne et rester dans son personnage.",
  },
  { q: "J'ai été refusé, quand puis-je repostuler ?", a: "Immédiatement après un refus." },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 border-b border-white/10 pb-4">
      <h2 className="m-0 text-[clamp(28px,3.6vw,40px)] font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
        {children}
      </h2>
    </div>
  );
}

export default function AccueilClient() {
  const [openFaq, setOpenFaq] = useState<number>(0);

  // Arrivée depuis /intro : l'emblème en vol se pose sur celui du hero.
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
      // Le logo de la vidéo est plus grand que celui du hero : le vol réduit
      // l'échelle pour arriver à la taille du hero.
      await emblemFlight.flyTo({ x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width, duration: 900 });
      heroEmblem.style.transition = "opacity 0.45s ease";
      heroEmblem.style.opacity = "1";
      emblemFlight.settle();
      window.history.replaceState({}, "", "/accueil");
    }));
  }, []);

  return (
    <div className="lsms-root" id="top">
      <div className="relative z-[1] mx-auto max-w-[1240px] px-5 sm:px-[30px]">
        <section className="pb-[80px] pt-[100px] text-center">
          <h1
            className="mb-2 text-balance font-bold leading-[0.98] tracking-[-0.03em]"
            style={{ fontSize: "clamp(52px, 8.5vw, 108px)" }}
          >
            Los Santos
            <br />
            <span className="text-[#9FC6F5]">Medical Services</span>
          </h1>
          <p className="mx-auto mb-10 mt-6 max-w-[640px] text-[19px] leading-[1.6] text-[rgba(235,245,242,0.72)]">
            Les candidatures se déposent en ligne. La réponse est envoyée sur Discord sous 48 h.
          </p>
          <div className="mb-[60px] flex flex-wrap justify-center gap-4">
            <Link href="/candidature" className="lsms-cta">
              Déposer ma candidature
            </Link>
            <a href="#faq" className="lsms-pill !px-[36px] !py-[17px] !text-[15px] font-medium">
              Voir la FAQ
            </a>
          </div>
          <div data-hero-emblem className="inline-block">
            <Image
              src="/lsms/emblem-hd.png"
              alt="Emblème du Los Santos Medical Services"
              width={240}
              height={240}
              priority
              className="h-auto w-[240px]"
            />
          </div>
        </section>

        <section id="divisions" className="pb-[90px] pt-[40px]">
          <SectionTitle>Divisions</SectionTitle>
          <div className="grid items-stretch gap-4 [grid-auto-rows:1fr] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {DIVISIONS.map((d) => (
              <Link
                key={d.slug}
                href={`/divisions/${d.slug}`}
                className="lsms-glass lsms-card flex h-full w-full flex-col items-center justify-center rounded-[20px] px-7 py-[30px] text-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.logo} alt={d.name} className="mb-4 inline-block h-24 w-24 object-contain" />
                <h3 className="m-0 text-[18px] font-semibold">{d.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section id="avantages" className="pb-[90px] pt-[40px]">
          <SectionTitle>Avantages</SectionTitle>
          <dl className="m-0 divide-y divide-white/10 border-b border-white/10">
            {AVANTAGES.map((a) => (
              <div key={a.t} className="grid gap-1 py-5 sm:grid-cols-[280px_1fr] sm:gap-8">
                <dt className="text-[18px] font-semibold">{a.t}</dt>
                <dd className="m-0 text-[15px] leading-[1.6] text-[rgba(235,245,242,0.65)]">{a.d}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="faq" className="pb-[90px] pt-[40px]">
          <SectionTitle>Questions fréquentes</SectionTitle>
          <div className="divide-y divide-white/10 border-b border-white/10">
            {FAQ_ITEMS.map((f, i) => (
              <div key={f.q} className="py-5">
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
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
