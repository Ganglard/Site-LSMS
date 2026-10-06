import Link from "next/link";
import { notFound } from "next/navigation";
import { LsmsHeader, LsmsFooter } from "../../chrome";
import { DivisionPhoto } from "../../divisions/DivisionPhoto";
import "../../lsms.css";

interface Division {
  name: string;
  full: string;
  accent: string;
  accentRgb: string;
  logo: string;
  tagline: string;
  intro: string;
  missions: [string, string][];
  profil: string[];
}

const DIVISIONS: Record<string, Division> = {
  "medical-academy": {
    name: "Medical Academy", full: "Los Santos Medical Academy",
    accent: "#5B8DD9", accentRgb: "91,141,217", logo: "/lsms/divisions/medical-academy.png",
    tagline: "L'académie forme les nouveaux soignants du LSMS.",
    intro: "L'Académie médicale est la porte d'entrée du LSMS. Ses instructeurs forment les recrues aux protocoles de soins, au triage, à la communication radio et à l'éthique médicale. Chaque promotion est évaluée avant d'intégrer le service.",
    missions: [
      ["Formation des recrues", "Premiers secours, protocoles de soins, triage, rapport d'intervention et usage de la radio, du premier appel au dernier examen."],
      ["Immersion accompagnée", "Les instructeurs emmènent les recrues sur des interventions réelles et encadrent leurs premiers pas sur le terrain."],
      ["Évaluation", "Chaque recrue est suivie et notée. L'académie valide ou non l'entrée définitive dans le LSMS."],
      ["Formation continue", "Triage avancé, gestion d'événements de masse, nouveaux protocoles : les soignants confirmés y reviennent régulièrement."],
    ],
    profil: ["Envie d'apprendre et d'écouter.", "Patience avec les recrues.", "Comportement exemplaire, y compris en dehors des cours.", "Aucune expérience requise, la formation part des bases."],
  },
  surgery: {
    name: "Surgery", full: "Surgery Service",
    accent: "#57B894", accentRgb: "87,184,148", logo: "/lsms/divisions/surgery.png",
    tagline: "Le service de chirurgie du LSMS.",
    intro: "Le Surgery Service regroupe les chirurgiens du LSMS. Blocs opératoires de Central Medical, gardes de jour et de nuit, interventions d'urgence : il prend en charge les cas les plus graves.",
    missions: [
      ["Chirurgie d'urgence", "Plaies par balle, accidents graves : l'équipe prend le relais des paramedics dès l'arrivée du patient."],
      ["Blocs opératoires", "Interventions programmées et gardes d'urgence, de jour comme de nuit, au bloc de Central Medical."],
      ["Suivi post-opératoire", "Suivi du patient après l'opération : soins, surveillance, rééducation."],
      ["Enseignement", "Transmission aux plus jeunes : gestes, protocoles, conduite au bloc."],
    ],
    profil: ["Sang-froid en situation d'urgence.", "Précision dans les gestes.", "Travail en équipe : au bloc, personne n'agit seul.", "Disponibilité pour les gardes de nuit et les urgences."],
  },
  "clinical-laboratory": {
    name: "Clinical Laboratory", full: "Clinical Laboratory Service",
    accent: "#7FD4C1", accentRgb: "127,212,193", logo: "/lsms/divisions/clinical-laboratory.png",
    tagline: "Le laboratoire d'analyses du LSMS.",
    intro: "Le Clinical Laboratory Service réalise les analyses du LSMS : sang, toxicologie, bactériologie. Ses techniciens produisent les résultats sur lesquels s'appuient les diagnostics et les traitements.",
    missions: [
      ["Analyses sanguines", "Groupes sanguins, transfusions d'urgence : le laboratoire répond en quelques minutes quand le patient en a besoin."],
      ["Toxicologie", "Dépistages, suspicions d'empoisonnement, expertises pour la police et la justice."],
      ["Prélèvements sur le terrain", "Intervention auprès des paramedics pour prélever sur scène ou au chevet du patient."],
      ["Veille sanitaire", "Suivi des épidémies, alertes, hygiène hospitalière."],
    ],
    profil: ["Rigueur : une erreur d'analyse peut avoir des conséquences graves.", "Respect des procédures et de la traçabilité des échantillons.", "Calme face à un résultat anormal.", "Intérêt pour un rôle scientifique au sein du service."],
  },
  psychological: {
    name: "Psychological", full: "Psychological Service",
    accent: "#D9A8C4", accentRgb: "217,168,196", logo: "/lsms/divisions/psychological.png",
    tagline: "Le suivi psychologique des patients et du personnel.",
    intro: "Le Psychological Service accompagne la santé mentale des habitants de Los Santos et du personnel du LSMS : victimes de traumatismes, soignants épuisés, patients en détresse.",
    missions: [
      ["Suivi des victimes", "Accidents, agressions, deuils : accompagnement psychologique après l'urgence médicale."],
      ["Permanence d'écoute", "Consultations au centre médical, ouvertes aux patients comme au personnel."],
      ["Cellule d'urgence psychologique", "Prise en charge immédiate sur les scènes graves : prises d'otages, accidents collectifs, drames familiaux."],
      ["Soutien du personnel", "Suivi des soignants confrontés à des interventions difficiles."],
    ],
    profil: ["Écoute sans jugement.", "Respect strict du secret professionnel.", "Stabilité émotionnelle en consultation.", "Capacité à reconnaître ses limites et à orienter vers un collègue."],
  },
  obstetricians: {
    name: "Obstetricians", full: "Obstetricians Services",
    accent: "#D98FC0", accentRgb: "217,143,192", logo: "/lsms/divisions/obstetricians.png",
    tagline: "Le suivi des grossesses et des accouchements.",
    intro: "Les Obstetricians Services accompagnent les femmes enceintes de Los Santos, du suivi de grossesse à l'accouchement, en maternité comme en urgence.",
    missions: [
      ["Suivi de grossesse", "Consultations prénatales, échographies, préparation à l'accouchement."],
      ["Accouchements", "En maternité comme en urgence, y compris sur la voie publique."],
      ["Urgences obstétricales", "Complications et accouchements difficiles : prise en charge immédiate."],
      ["Soins du nouveau-né", "Premiers soins, pesée, surveillance des premières heures."],
    ],
    profil: ["Calme en situation d'urgence.", "Douceur et attention envers les patientes.", "Respect strict de l'intimité des patientes.", "Savoir annoncer une naissance comme gérer un deuil."],
  },
  mortuary: {
    name: "Mortuary", full: "Mortuary Service",
    accent: "#8A9BC9", accentRgb: "138,155,201", logo: "/lsms/divisions/mortuary.png",
    tagline: "La prise en charge des personnes décédées.",
    intro: "Le Mortuary Service prend en charge les personnes décédées : transport des corps, thanatopraxie, identification, accompagnement des familles.",
    missions: [
      ["Transport des corps", "Transport rapide, discret et respectueux de chaque défunt."],
      ["Identifications", "Constats et relevés avec la police et le coroner, participation aux enquêtes."],
      ["Thanatopraxie", "Soins de conservation, préparation des corps, restauration si nécessaire."],
      ["Accompagnement des familles", "Restitution des effets personnels et information des proches."],
    ],
    profil: ["Respect des défunts et de leurs familles.", "Capacité à prendre du recul sur le plan émotionnel.", "Discrétion totale.", "Rigueur dans les procédures : la traçabilité des corps est une obligation légale."],
  },
};

export function generateStaticParams() {
  return Object.keys(DIVISIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DIVISIONS[slug];
  return { title: d ? `LSMS : ${d.full}` : "LSMS : Division" };
}

export default async function DivisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DIVISIONS[slug];
  if (!d) notFound();
  const others = Object.entries(DIVISIONS).filter(([k]) => k !== slug);

  return (
    <div className="lsms-root">
      <LsmsHeader />

      <div className="relative z-[1] mx-auto max-w-[1240px] px-5 sm:px-[30px]">
        <section className="pb-[70px] pt-[90px]">
          <div className="grid items-center gap-[50px] lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="mb-[22px] uppercase leading-[0.95]" style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: "clamp(56px,7.5vw,104px)", fontWeight: 700 }}>
                {d.name}<span style={{ color: d.accent }}>.</span>
              </h1>
              <p className="mb-4 max-w-[560px] text-[20px] leading-[1.6] text-[rgba(235,245,242,0.8)]">{d.tagline}</p>
              <p className="mb-9 max-w-[560px] text-[15.5px] leading-[1.7] text-[rgba(235,245,242,0.6)]">{d.intro}</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="lsms-glass flex h-[260px] w-[260px] items-center justify-center rounded-[28px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.logo} alt={d.full} width={360} height={360} loading="eager" className="h-auto w-[72%]" />
              </div>
            </div>
          </div>
        </section>

        <section className="pb-[80px]">
          <div className="mb-8 border-b border-white/10 pb-4">
            <h2 className="m-0 text-[clamp(28px,3.6vw,40px)] font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
              Missions
            </h2>
          </div>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {d.missions.map(([t, desc]) => (
              <div key={t} className="border-t pt-5" style={{ borderColor: `rgba(${d.accentRgb},0.5)` }}>
                <h3 className="mb-2 text-[18px] font-semibold">{t}</h3>
                <p className="m-0 text-[15px] leading-[1.65] text-[rgba(235,245,242,0.65)]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid items-stretch gap-[26px] pb-[20px] lg:grid-cols-[0.85fr_1.15fr]">
          <DivisionPhoto slug={slug} accentRgb={d.accentRgb} name={d.name} />
          <div className="lsms-glass h-full rounded-[24px] px-[38px] py-10">
            <h2 className="mb-7 mt-0 text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
              Profil recherché
            </h2>
            {d.profil.map((p) => (
              <div key={p} className="mb-4 flex items-start gap-3.5">
                <span className="mt-[9px] h-[6px] w-[6px] flex-none" style={{ background: d.accent }} />
                <p className="m-0 text-[15px] leading-[1.62] text-[rgba(235,245,242,0.72)]">{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-[90px] pt-[70px]">
          <div className="mb-6 text-[13px] uppercase tracking-[0.2em] text-[rgba(235,245,242,0.5)]">Autres divisions</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <div className="lsms-glass flex h-full flex-col items-center rounded-[16px] px-2 py-4 text-center" style={{ borderColor: `rgba(${d.accentRgb},0.55)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.logo} alt="" width={40} height={40} loading="eager" className="mb-2 block h-10 w-10 object-contain" />
              <div className="text-[11.5px] font-semibold uppercase leading-tight tracking-[0.06em]" style={{ fontFamily: "var(--font-saira), sans-serif", color: d.accent }}>{d.name}</div>
            </div>
            {others.map(([k, o]) => (
              <Link key={k} href={`/divisions/${k}`} className="lsms-glass flex h-full flex-col items-center rounded-[16px] px-2 py-4 text-center opacity-70 transition-opacity hover:opacity-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.logo} alt="" width={40} height={40} loading="lazy" className="mb-2 block h-10 w-10 object-contain" />
                <div className="text-[11.5px] font-semibold uppercase leading-tight tracking-[0.06em] text-[rgba(235,245,242,0.7)]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>{o.name}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <LsmsFooter />
    </div>
  );
}
