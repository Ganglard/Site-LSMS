import Link from "next/link";
import { notFound } from "next/navigation";
import { LsmsHeader, LsmsFooter } from "../../chrome";
import { Reveal } from "../../reveal";
import "../../lsms.css";

interface Division {
  num: string;
  code: string;
  name: string;
  full: string;
  accent: string;
  accentRgb: string;
  logo: string;
  tagline: string;
  devise: string;
  intro: string;
  stats: [string, string][];
  missions: [string, string, string][];
  steps: [string, string][];
  profil: string[];
}

const DIVISIONS: Record<string, Division> = {
  "medical-academy": {
    num: "01", code: "MEDICAL ACADEMY", name: "Medical Academy", full: "Los Santos Medical Academy",
    accent: "#5B8DD9", accentRgb: "91,141,217", logo: "/lsms/divisions/medical-academy.png",
    tagline: "L'Academie forme ceux qui soignent Los Santos.",
    devise: "« Ce que tu apprends ici sauvera des vies dehors »",
    intro: "L'Academie Medicale est la porte d'entree du LSMS. Ses instructeurs, tous passeurs d'experience, forment les nouveaux soignants aux protocoles de soins, au triage, a la communication radio et a l'ethique medicale. Chaque promotion sort prete au terrain.",
    stats: [["Effectif", "Instructeurs dedies"], ["Acces", "Sur candidature"], ["Cursus", "Formation complete + examens"]],
    missions: [
      ["🎓", "Formation des recrues", "Du premier appel radio au dernier examen : gestes de premiers secours, protocoles de soins, triage, rapport d'intervention. Rien ne se devine."],
      ["🚑", "Immersion accompagnee", "Les instructeurs emmenent les recrues sur des interventions reelles, on apprend le terrain sur le terrain, avec un filet de securite."],
      ["📋", "Evaluation", "Chaque recrue est suivie et notee. L'Academie valide (ou non) l'entree definitive dans le LSMS."],
      ["🔁", "Formation continue", "Triage avance, gestion de masse, nouveaux protocoles : les soignants confirms y reviennent regulierement."],
    ],
    steps: [["Candidature", "Postuler via le site, dossier examine par la direction des ressources humaines."], ["Formation", "Cursus complet a l'Academie : theorie, pratiques, mises en situation, examens."], ["Serment", "Validation finale et affectation dans une division du LSMS."]],
    profil: ["Envie d'apprendre et d'ecouter, la pedagogie passe avant la performance.", "Une patience reelle, la recrue qui rate aujourd'hui sauvera des vies demain.", "Une exemplarite permanente, l'Academie observe aussi ce que tu fais hors des cours.", "Zero experience requise, on part des bases."],
  },
  surgery: {
    num: "02", code: "SURGERY SERVICE", name: "Surgery", full: "Surgery Service",
    accent: "#57B894", accentRgb: "87,184,148", logo: "/lsms/divisions/surgery.png",
    tagline: "Au bloc, chaque seconde decide.",
    devise: "« Mains stables, esprit clair »",
    intro: "Le Surgery Service regroupe les chirurgiens du LSMS. Blocs operatoires de Central Medical, gardes jour et nuit, interventions d'urgence : c'est la que se joue la frontiere entre la vie et la mort pour les cas les plus graves.",
    stats: [["Effectif", "Equipe de garde 24/7"], ["Acces", "Formation specialisee"], ["Terrain", "Blocs de Central Medical"]],
    missions: [
      ["🔪", "Chirurgie d'urgence", " Plaies par balle, accidents graves, l'equipe prend le relais des paramedics des l'arrivee du patient."],
      ["🏥", "Blocs operatoires", "Interventions programmees et gardes d'urgence, jour et nuit, au bloc de Central Medical."],
      ["🩹", "Suivi post-operatoire", "Le chirurgien ne s'arrete pas a l'operation : suivi du patient, soins, revalidation."],
      ["📚", "Enseignement", "Transmission aux plus jeunes : gestes, protocoles, sang-froid au bloc."],
    ],
    steps: [["Base", "Reussir la formation initiale de l'Academie Medicale."], ["Specialisation", "Formation au bloc : gestes chirurgicaux, protocoles d'urgence, travail en equipe."], ["Garde", "Integration a l'equipe de garde du Surgery Service."]],
    profil: ["Un sang-froid a toute epreuve, au bloc la panique se transmet plus vite que le sang.", "Une precision gestuelle, chaque mouvement compte.", "L'envie de travailler en equipe, au bloc personne n'agit seul.", "Assumer les gardes de nuit et les urgences qui n'attendent pas."],
  },
  "clinical-laboratory": {
    num: "03", code: "CLINICAL LABORATORY", name: "Clinical Laboratory", full: "Clinical Laboratory Service",
    accent: "#7FD4C1", accentRgb: "127,212,193", logo: "/lsms/divisions/clinical-laboratory.png",
    tagline: "Le diagnostic commence a l'echelle microscopique.",
    devise: "« La reponse est dans l'analyse »",
    intro: "Le Clinical Laboratory Service est le laboratoire d'analyses du LSMS. Sang, toxicologie, bacteriologie : ses techniciens produisent les resultats qui orientent chaque diagnostic et chaque traitement. Un travail meticuleux, discret et indispensable.",
    stats: [["Effectif", "Techniciens labo"], ["Acces", "Formation specialisee"], ["Terrain", "Laboratoires + prelevements"]],
    missions: [
      ["🧪", "Analyses sanguines", "Groupes sanguins, transfusions d'urgence, le labo repond en minutes quand la vie du patient en depend."],
      ["🔬", "Toxicologie", "Depistages, suspicions d'empoisonnement, expertise pour la police et la justice."],
      ["💉", "Prelevements terrain", "Interventions aupres des paramedics pour prelever sur scene ou au chevet du patient."],
      ["📊", "Veille sanitaire", "Suivi des epidemies, alertes, hygieme hospitaliere : le labo surveille la sante de toute la ville."],
    ],
    steps: [["Base", "Reussir la formation initiale de l'Academie Medicale."], ["Specialisation", "Formation laboratoire : prelevements, analyses, materialie, protocoles d'hygiene."], ["Affectation", "Integration a l'equipe du laboratoire de Central Medical."]],
    profil: ["Une rigueur absolue, un resultat d'analyse errone peut tuer.", "L'aise avec la procedure et la tracabilite, chaque echantillon est compte.", "Un calme analytique, on ne s'affole pas sur un resultat anormal.", "L'envie d'un role scientifique au cœur de l'action."],
  },
  psychological: {
    num: "04", code: "PSYCHOLOGICAL SERVICE", name: "Psychological", full: "Psychological Service",
    accent: "#D9A8C4", accentRgb: "217,168,196", logo: "/lsms/divisions/psychological.png",
    tagline: "Soigner l'esprit, reconstruire la personne.",
    devise: "« Ecouter, c'est deja soigner »",
    intro: "Le Psychological Service accompagne la sante mentale des habitants de Los Santos et du personnel du LSMS. Victimes de traumatismes, soignants epuises, patients en detresse : ses psychologues offrent une ecoute et un suivi au long cours.",
    stats: [["Effectif", "Psychologues"], ["Acces", "Formation specialisee"], ["Terrain", "Consultations + interventions"]],
    missions: [
      ["🧠", "Suivi des victimes", "Accidents, agressions, deuils : un accompagnement psychologique apres l'urgence medicale."],
      ["💬", "Permanence d'ecoute", "Consultations au centre medical, la porte du psychologue est toujours ouverte, pour les patients comme pour le personnel."],
      ["🚨", "Cellule d'urgence psychologique", "Prise en charge immediate sur les scenes graves : prises d'otages, accidents collectifs, drames familiaux."],
      ["🤝", "Soutien du personnel", "Les soignants aussi craquent : le service veille sur ceux qui veillent sur les autres."],
    ],
    steps: [["Base", "Reussir la formation initiale de l'Academie Medicale."], ["Specialisation", "Formation psychologie : entretien, gestion de crise, secret professionnel, deontologie."], ["Pratique", "Consultations accompagnees puis autonomie progressive."]],
    profil: ["Une ecoute reelle, sans jugement, la parole du patient passe avant tout.", "Le respect absolu du secret professionnel.", "Une stabilite emotionnelle, on ne se casse pas en pleurs a chaque consultation.", "Savoir reconnaitre ses limites et orienter vers un collegue quand il le faut."],
  },
  obstetricians: {
    num: "05", code: "OBSTETRICIANS SERVICES", name: "Obstetricians", full: "Obstetricians Services",
    accent: "#D98FC0", accentRgb: "217,143,192", logo: "/lsms/divisions/obstetricians.png",
    tagline: "Accueillir la vie, proteger les meres.",
    devise: "« Deux vies a chaque intervention »",
    intro: "Les Obstetricians Services accompagnent les femmes enceintes de Los Santos, du suivi de grossesse a l'accouchement, en maternite comme en urgence. Une division ou la joie du premier cri cotoie parfois l'urgence vitale.",
    stats: [["Effectif", "Sages-femmes + obstetriciens"], ["Acces", "Formation specialisee"], ["Terrain", "Maternite + urgences"]],
    missions: [
      ["🤰", "Suivi de grossesse", "Consultations prénatales, echographies, preparation a l'accouchement : un accompagnement sur des mois."],
      ["👶", "Accouchements", "En maternite comme en urgence, accouchement inopine sur la voie publique compris."],
      ["🚨", "Urgences obstetricales", "Complications, accouchements difficiles, la division reagit en minutes."],
      ["💕", "Soins du nouveau-ne", "Premiers soins, premiere pesee, les premiers moments d'une vie."],
    ],
    steps: [["Base", "Reussir la formation initiale de l'Academie Medicale."], ["Specialisation", "Formation obstetrique : suivi de grossesse, accouchement, soins du nouveau-ne, urgences."], ["Garde", "Integration a l'equipe de maternite."]],
    profil: ["Un calme a toute epreuve, l'urgence obstetricale ne pardonne pas la panique.", "Une douceur reelle, on accueille une vie, on ne la traite pas comme un dossier.", "Le respect de l'intimite des patientes, sans exception.", "Savoir feliciter comme gerer la perte, la vie est faite des deux."],
  },
  mortuary: {
    num: "06", code: "MORTUARY SERVICE", name: "Mortuary", full: "Mortuary Service",
    accent: "#8A9BC9", accentRgb: "138,155,201", logo: "/lsms/divisions/mortuary.png",
    tagline: "Le respect ne s'arrete pas a la mort.",
    devise: "« Dignite jusqu'au bout »",
    intro: "Le Mortuary Service prend en charge les personnes decedees : transport des corps, thanatopraxie, identification, accompagnement des familles. Une division silencieuse, respectee, ou le professionnalisme se mesure au respect de ceux qui ne peuvent plus le demander.",
    stats: [["Effectif", "Equipe dediee"], ["Acces", "Formation specialisee"], ["Terrain", "Morgue de Central Medical"]],
    missions: [
      ["🕊️", "Transport des corps", "Rapide, discret, respectueux : le LSMS prend en charge chaque defunt avec dignite."],
      ["🔍", "Identifications", "Avec la police et le coroner : constats, releves, participation aux enquetes."],
      ["⚕️", "Thanatopraxie", "Soins de conservation, preparation des corps, restauration si necessaire."],
      ["🕯️", "Accompagnement des familles", "Restitution des effets personnels, information, humanite dans les pires moments."],
    ],
    steps: [["Base", "Reussir la formation initiale de l'Academie Medicale."], ["Specialisation", "Formation thanatologique : procedures legales, thanatopraxie, relation aux familles endeuillees."], ["Integation", "Integration a l'equipe de la morgue de Central Medical."]],
    profil: ["Un respect profond pour les defunts et leurs familles, sans exception.", "Un détachement emotionnel sain, on n'emmene pas son travail a la maison.", "Une discretion totale, la mort n'est pas un sujet de commérage.", "Le sens de la procedure, la tracabilite des corps est une obligation legale."],
  },
};

export function generateStaticParams() {
  return Object.keys(DIVISIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DIVISIONS[slug];
  return { title: d ? `LSMS · ${d.full}` : "LSMS · Division" };
}

export default async function DivisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DIVISIONS[slug];
  if (!d) notFound();
  const others = Object.entries(DIVISIONS).filter(([k]) => k !== slug);

  return (
    <div className="lsms-root">
      {/* Orbes accent */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-20 -top-[140px] h-[520px] w-[520px] rounded-full blur-[110px]" style={{ background: `rgba(${d.accentRgb},0.16)` }} />
        <div className="absolute -bottom-[160px] -right-[100px] h-[560px] w-[560px] rounded-full blur-[120px]" style={{ background: `rgba(${d.accentRgb},0.14)` }} />
      </div>

      <LsmsHeader />

      <div className="relative z-[1] mx-auto max-w-[1240px] px-5 sm:px-[30px]">
        {/* HERO */}
        <section className="relative pb-[70px] pt-[90px]">
          <div className="pointer-events-none absolute -right-10 top-[30px] select-none font-bold leading-[0.8] text-white/[0.03]" style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: "clamp(200px,28vw,380px)" }}>
            {d.num}
          </div>
          <div className="grid items-center gap-[50px] lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="mb-[22px] uppercase leading-[0.95]" style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: "clamp(56px,7.5vw,104px)", fontWeight: 700 }}>
                {d.name}<span style={{ color: d.accent }}>.</span>
              </h1>
              <p className="mb-4 max-w-[560px] text-[20px] font-light leading-[1.6] text-[rgba(235,245,242,0.75)]">{d.tagline}</p>
              <p className="mb-9 max-w-[560px] text-[15.5px] leading-[1.7] text-[rgba(235,245,242,0.55)]">{d.intro}</p>
              <div className="grid max-w-[480px] grid-cols-1 gap-3 sm:grid-cols-3">
                {d.stats.map(([k, v]) => (
                  <div key={k} className="lsms-glass rounded-[18px] px-4 py-4 text-center">
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[rgba(235,245,242,0.5)]">{k}</div>
                    <div className="mt-1.5 text-[14px] font-semibold leading-snug">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative flex w-full max-w-[380px] items-center justify-center">
                <div className="lsms-spin absolute h-[400px] w-[400px] rounded-full blur-[46px]" style={{ background: `conic-gradient(from 0deg, rgba(${d.accentRgb},0), rgba(${d.accentRgb},0.22), rgba(${d.accentRgb},0.05), rgba(${d.accentRgb},0))` }} />
                <div className="absolute h-[330px] w-[330px] rounded-full border border-white/[0.12]" />
                <div className="lsms-spin-slow absolute h-[260px] w-[260px] rounded-full border border-dashed" style={{ borderColor: `rgba(${d.accentRgb},0.35)` }} />
                <div className="lsms-glass lsms-float flex h-[250px] w-[250px] items-center justify-center rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.logo} alt={d.full} width={360} height={360} loading="eager" className="h-auto w-[72%] drop-shadow-[0_14px_34px_rgba(0,0,0,0.6)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MISSIONS */}
        <section className="pb-[90px]">
          <Reveal className="mb-[54px] text-center">
            <span className="lsms-pill !text-[11.5px] font-semibold uppercase tracking-[0.26em]" style={{ color: d.accent }}>Missions</span>
            <h2 className="mt-5 font-bold tracking-[-0.02em]" style={{ fontSize: "clamp(34px,4.6vw,56px)" }}>Le quotidien de la division</h2>
            <p className="mx-auto mt-4 max-w-[540px] text-[17px] font-light text-[rgba(235,245,242,0.6)]">{d.devise}</p>
          </Reveal>
          <div className="grid items-stretch gap-5 [grid-auto-rows:1fr] [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {d.missions.map(([ico, t, desc]) => (
              <Reveal key={t} className="h-full">
                <div className="lsms-glass h-full rounded-[26px] p-[26px] transition-transform duration-500" style={{ transitionTimingFunction: "var(--ease-out)" }}>
                  <div className="mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-2xl border text-2xl" style={{ background: `rgba(${d.accentRgb},0.14)`, borderColor: `rgba(${d.accentRgb},0.3)` }}>
                    {ico}
                  </div>
                  <h3 className="mb-2.5 text-[17.5px] font-semibold">{t}</h3>
                  <p className="m-0 text-[14.5px] leading-[1.65] text-[rgba(235,245,242,0.6)]">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PARCOURS + PROFIL */}
        <section className="grid items-stretch gap-[26px] pb-[90px] lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="lsms-glass h-full rounded-[30px] px-[38px] py-10">
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.26em]" style={{ color: d.accent }}>Integration</span>
              <h2 className="mb-[30px] mt-4 font-bold tracking-[-0.02em]" style={{ fontSize: "clamp(28px,3.4vw,38px)" }}>Le parcours pour rejoindre</h2>
              <ol className="m-0 list-none p-0">
                {d.steps.map(([t, desc], i) => (
                  <li key={t} className="mb-6 flex items-start gap-4 last:mb-0">
                    <span className="lsms-pill flex h-9 w-9 flex-none items-center justify-center !p-0 text-[14px] font-bold" style={{ color: d.accent }}>{i + 1}</span>
                    <div>
                      <div className="text-[15.5px] font-semibold">{t}</div>
                      <p className="m-0 mt-1 text-[14px] leading-[1.6] text-[rgba(235,245,242,0.6)]">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
          <Reveal className="h-full">
            <div className="lsms-glass h-full rounded-[30px] px-[38px] py-10">
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.26em]" style={{ color: d.accent }}>Recrutement</span>
              <h2 className="mb-[30px] mt-4 font-bold tracking-[-0.02em]" style={{ fontSize: "clamp(28px,3.4vw,38px)" }}>Le profil recherche</h2>
              {d.profil.map((p) => (
                <div key={p} className="mb-5 flex items-start gap-3.5">
                  <span className="mt-0.5 flex-none text-[15px]" style={{ color: d.accent }}>✓</span>
                  <p className="m-0 text-[15px] leading-[1.62] text-[rgba(235,245,242,0.68)]">{p}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* CTA */}
        <section className="pb-[90px] text-center">
          <Reveal>
            <Link href="/candidature" className="lsms-cta">Postuler au {d.full}</Link>
          </Reveal>
        </section>

        {/* NAVIGATEUR DIVISIONS */}
        <section className="pb-[90px]">
          <div className="mb-[38px] text-center">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-[rgba(235,245,242,0.5)]">Explorer les autres divisions</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {others.map(([k, o]) => (
              <Link key={k} href={`/divisions/${k}`} className="lsms-glass flex h-full flex-col items-center rounded-[20px] px-2 py-4 text-center opacity-70 transition-transform duration-500 hover:opacity-100" style={{ transitionTimingFunction: "var(--ease-out)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.logo} alt="" width={40} height={40} loading="lazy" className="mb-2 block h-10 w-10 object-contain grayscale-[0.35]" />
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
