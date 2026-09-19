"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import "../lsms.css";

const REF_PREFIX = "LSMS-";
const DRAFT_KEY = "lsms-form101-draft";
const INTRO_KEY = "lsmsFormIntroPlayed";
const SUBMIT_ENDPOINT = "/api/candidature";

type Section = {
  title: string;
  fields: {
    key: string;
    label: string;
    type: "text" | "number" | "select" | "textarea" | "checks";
    placeholder?: string;
    options?: string[];
    rows?: number;
    full?: boolean;
    required?: boolean;
    note?: string;
  }[];
};

const SECTIONS: Section[] = [
  {
    title: "Section 1 · Informations personnelles (RP)",
    fields: [
      { key: "nom", label: "Nom", type: "text", placeholder: "ex. Smith", required: true },
      { key: "prenom", label: "Prenom", type: "text", placeholder: "ex. John", required: true },
      { key: "genre", label: "Genre", type: "select", options: ["Masculin", "Feminin", "Autre"], required: true },
      { key: "nationalite", label: "Nationalite", type: "text", placeholder: "ex. Americain", required: true },
      { key: "dateNaissance", label: "Date de naissance", type: "text", placeholder: "DD/MM/YYYY", required: true },
      { key: "lieuNaissance", label: "Lieu de naissance", type: "text", placeholder: "ex. Los Santos, San Andreas", required: true },
      { key: "numeroBancaire", label: "Numero bancaire", type: "text", placeholder: "ex. 123456789", required: true },
      { key: "adresse", label: "Adresse", type: "text", placeholder: "ex. 123 Vinewood Blvd, Los Santos, SA 90001", full: true, required: true },
      { key: "telephone", label: "Numero de telephone", type: "text", placeholder: "ex. 555-0123", required: true },
      { key: "situationPro", label: "Situation professionnelle actuelle", type: "text", placeholder: "ex. Etudiant, Secouriste, Sans emploi", required: true },
      { key: "casierJudiciaire", label: "Possedez-vous un casier judiciaire ?", type: "select", options: ["Non", "Oui"], required: true },
      { key: "permisConduire", label: "Avez-vous le permis de conduire ?", type: "select", options: ["Oui", "Non"], required: true },
      { key: "permisConduireInfo", label: "Si oui, categories (moto, voiture, poids lourd...)", type: "text", placeholder: "ex. Voiture + Moto" },
      { key: "niveauEtudes", label: "Niveau d'etudes / formation medicale (RP)", type: "select", options: ["Aucune", "Secourisme de base", "Paramedic", "Etudes medicales"], required: true },
    ],
  },
  {
    title: "Section 2 · Questions generales (RP)",
    fields: [
      { key: "presentation", label: "Presentez-vous brievement (hobbies, qualites, defauts..)", type: "textarea", rows: 3, placeholder: "Qui etes-vous ? Presentez vos centres d'interet et vos points forts.", full: true, required: true },
      { key: "experiencesPro", label: "Quelles sont vos experiences professionnelles ?", type: "textarea", rows: 3, placeholder: "Decrivez vos anciens emplois et les competences acquises.", full: true, required: true },
      { key: "motivations", label: "Vos motivations ?", type: "textarea", rows: 3, placeholder: "Pourquoi souhaitez-vous rejoindre le Los Santos Medical Services ?", full: true, required: true },
      { key: "disponibilites", label: "Vos disponibilites hebdomadaires", type: "text", placeholder: "ex. 15h/semaine, soirs et week-ends", required: true },
    ],
  },
  {
    title: "Section 3 · Experience roleplay (HRP)",
    fields: [
      // L'ID Discord du candidat est recupere via OAuth (cookie d'auth)
      // et n'est pas demande dans le formulaire. Voir /api/candidature.
      { key: "experiencesRp", label: "Quelles sont vos experiences RP ?", type: "textarea", rows: 3, placeholder: "Serveurs RP, factions et roles precedents. Ecrivez « aucune » si vous debutez.", full: true, required: true },
      { key: "heuresJeu", label: "Combien d'heures de jeu FiveM avez-vous ?", type: "text", placeholder: "ex. 500 heures", required: true },
      { key: "experienceMedicale", label: "Avez-vous deja joue dans un service medical ou une faction similaire ?", type: "select", options: ["Oui", "Non"], required: true },
    ],
  },
];

const CHECKS = [
  { key: "truth", label: "Les informations de ce dossier sont exactes." },
  { key: "agree", label: "J'accepte les conditions de recrutement et le reglement interieur du LSMS." },
];

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{2})(\d{2})(\d{1,4})?/, (_, day, month, year) =>
    [day, month, year].filter(Boolean).join("/")
  );
}

export default function CandidatureClient() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [draftShown, setDraftShown] = useState(false);
  const [authUser, setAuthUser] = useState<{ authenticated: boolean; userId: string | null } | null>(null);
  // Intro video : la feuille n'apparait qu'apres la cinematique, en fondu enchaine
  const [introDone, setIntroDone] = useState(false);
  const [closing, setClosing] = useState(false); // fondu de sortie de l'overlay
  const [formShown, setFormShown] = useState(false); // entree de la feuille
  const sheetRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introClosedRef = useRef(false);

  /** Ferme l'intro et enchaine l'entree de la feuille (transition continue). */
  const closeIntro = useCallback(() => {
    if (introClosedRef.current) return;
    introClosedRef.current = true;
    setClosing(true);
    setFormShown(true);
    setTimeout(() => setIntroDone(true), 800);
  }, []);

  // Lecture de la video d'intro (une seule fois) + failsafe + reduced-motion
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = sessionStorage.getItem(INTRO_KEY) === "1";
    if (reduced || alreadyPlayed) {
      introClosedRef.current = true;
      setIntroDone(true);
      setFormShown(true);
      return;
    }
    const v = videoRef.current;
    if (!v) {
      const t = setTimeout(() => closeIntro(), 120);
      return () => clearTimeout(t);
    }
    v.muted = true;
    sessionStorage.setItem(INTRO_KEY, "1");
    void v.play().catch(() => {});
    const onEnded = () => closeIntro();
    v.addEventListener("ended", onEnded);
    const failsafe = setTimeout(() => closeIntro(), 9000);
    return () => {
      v.removeEventListener("ended", onEnded);
      clearTimeout(failsafe);
    };
  }, [closeIntro]);

  // Pas de scroll pendant la cinematique
  useEffect(() => {
    if (introDone) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [introDone]);

  // Auth Discord au montage
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => { if (active) setAuthUser(data); })
      .catch(() => { if (active) setAuthUser({ authenticated: false, userId: null }); });
    return () => { active = false; };
  }, []);

  // Restauration du brouillon
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (d && typeof d === "object") {
        const v: Record<string, string> = {};
        const c: Record<string, boolean> = {};
        for (const s of SECTIONS) for (const f of s.fields) if (typeof d[f.key] === "string") v[f.key] = d[f.key];
        for (const ch of CHECKS) c[ch.key] = !!d["_" + ch.key];
        setValues(v);
        setChecks(c);
        if (Object.keys(v).length) setDraftShown(true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (debounce 300ms)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const persist = (v: Record<string, string>, c: Record<string, boolean>) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const d: Record<string, unknown> = { ...v };
      for (const ch of CHECKS) d["_" + ch.key] = !!c[ch.key];
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
    }, 300);
  };
  const setField = (k: string, val: string) => {
    setValues((s) => { const n = { ...s, [k]: val }; persist(n, checks); return n; });
    setError("");
  };
  const setCheck = (k: string, val: boolean) => {
    setChecks((s) => { const n = { ...s, [k]: val }; persist(values, n); return n; });
    setError("");
  };

  const filled = (() => {
    let n = 0;
    for (const s of SECTIONS) for (const f of s.fields) if (f.required && (values[f.key] || "").trim()) n++;
    for (const c of CHECKS) if (checks[c.key]) n++;
    return n;
  })();
  const total = SECTIONS.flatMap((s) => s.fields).filter((f) => f.required).length + CHECKS.length;
  const pct = Math.round((filled / total) * 100);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    const missing: string[] = [];
    for (const s of SECTIONS) for (const f of s.fields) if (f.required && !(values[f.key] || "").trim()) missing.push(f.label);
    if (values.dateNaissance && !/^\d{2}\/\d{2}\/\d{4}$/.test(values.dateNaissance)) {
      missing.push("la date de naissance au format DD/MM/YYYY");
    }
    for (const c of CHECKS) if (!checks[c.key]) missing.push(c.label.toLowerCase());
    if (missing.length) { setError("Dossier incomplet : il manque " + missing.join(", ") + "."); return; }

    const ref = REF_PREFIX + String(Date.now()).slice(-6);
    setSending(true);
    setError("");

    const payload = {
      reference: ref,
      values: Object.fromEntries(
        SECTIONS.flatMap((s) => s.fields).filter((f) => f.type !== "checks").map((f) => [f.key, (values[f.key] ?? "").trim()])
      ),
      checks: {
        truth: !!checks.truth,
        agree: !!checks.agree,
      },
    };

    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "HTTP " + res.status);
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setSending(false);
      setSent(true);
      setReference(ref);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setSending(false);
      setError(`Envoi impossible pour le moment (${err instanceof Error ? err.message : "erreur reseau"}). Reessaie dans un instant.`);
    }
  }

  return (
    <div
      className="lsms-root"
      style={{ background: "radial-gradient(1200px 700px at 50% 8%, rgba(59,110,220,0.10), transparent 70%), radial-gradient(900px 900px at 85% 100%, rgba(30,58,138,0.10), transparent 65%), #060b16", backgroundAttachment: "fixed" }}
    >
      {/* INTRO VIDEO : le bureau -> formulaire, puis fondu enchaine sur la vraie feuille */}
      {!introDone && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden bg-[#050912]"
          style={{ opacity: closing ? 0 : 1, transition: "opacity 0.75s cubic-bezier(0.23,1,0.32,1)" }}
        >
          <video
            ref={videoRef}
            src="/lsms/uploads/bureau-lsms-zoom-v2.mp4"
            poster="/lsms/uploads/bureau-lsms-poster-v2.jpg"
            muted
            playsInline
            autoPlay
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            className="absolute bottom-[34px] left-9 z-[5] text-[12px] uppercase tracking-[0.3em] text-white/55"
            style={{ fontFamily: "var(--font-saira), sans-serif" }}
          >
            Direction des ressources humaines &middot; Central Medical, Pillbox Hill
          </span>
          <button
            type="button"
            onClick={closeIntro}
            className="absolute right-[34px] top-[30px] z-[5] cursor-pointer rounded-full border border-white/25 bg-black/45 px-6 py-2.5 text-[13px] uppercase tracking-[0.2em] text-white/85 transition-colors duration-300 hover:bg-black/65"
            style={{ fontFamily: "var(--font-saira), sans-serif" }}
          >
            Passer
          </button>
        </div>
      )}

      {/* Contenu : entree en douceur pendant que l'intro s'effface (fondu enchaine) */}
      <div
        className="relative z-[1] mx-auto max-w-[920px] px-[18px] pb-[90px] pt-[46px]"
        style={{
          opacity: formShown ? 1 : 0,
          transform: formShown ? "none" : "scale(1.035)",
          transition: "opacity 1.05s cubic-bezier(0.23,1,0.32,1), transform 1.45s cubic-bezier(0.23,1,0.32,1)",
          willChange: "opacity, transform",
        }}
      >
        <div className="mb-[30px] flex flex-wrap items-center justify-between gap-4">
          <a href="/accueil" className="flex items-center gap-2.5 text-[14px] font-semibold uppercase tracking-[0.16em] text-[#9FC6F5] hover:text-[#C9E0FF]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
            <Image src="/lsms/emblem.png" alt="" width={30} height={30} className="h-auto w-[30px]" />
            LOS SANTOS MEDICAL SERVICES
          </a>
          <a href="/accueil" className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#C9E0FF] hover:text-[#EAF3FF]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
            &larr; Retour au site
          </a>
        </div>

        <div className="relative" id="sheetWrap">
          {!sent && (
            <div className="absolute -top-4 right-[-14px] z-[3] w-[148px] bg-gradient-to-b from-[#C9DCF2] to-[#9FBedD] px-3.5 pb-[18px] pt-4 text-center shadow-[0_8px_22px_rgba(0,0,0,0.35)]" style={{ transform: "rotate(4deg)" }}>
              <div className="text-[38px] font-bold leading-none text-[#122E54]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>{pct}%</div>
              <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF]">complete</div>
              <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[rgba(30,64,175,0.18)]">
                <div className="h-full rounded-full bg-[#1E40AF] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <div
            ref={sheetRef}
            className="sheet relative rounded-[3px] bg-[linear-gradient(105deg,#F4FAF8_0%,#EEF6F3_48%,#E7F1ED_100%)] px-5 pb-14 pt-10 sm:px-[72px] sm:pt-16 text-[#12211E] shadow-[0_1px_2px_rgba(0,0,0,0.5),0_12px_34px_rgba(0,0,0,0.55),0_42px_90px_rgba(0,0,0,0.5)]"
            style={{ fontFamily: "var(--font-typer), monospace" }}
          >
            {/* Entete : croix rouge style dossier medical + tampon */}
            <div className="flex flex-wrap items-center gap-[18px] border-b-[2.5px] border-[#12211E] pb-[22px] sm:gap-[22px]">
              <div className="flex h-[84px] w-[84px] flex-none items-center justify-center rounded-md border-[3px] border-[#B02A37]">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="#B02A37" aria-hidden>
                  <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
                </svg>
              </div>
              <div>
                <h1 className="m-0 uppercase leading-[1.05] tracking-[0.05em] text-[#0D1B18]" style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: 34, fontWeight: 700 }}>
                  Los Santos Medical Services
                </h1>
                <div className="mt-1.5 text-[12.5px] tracking-[0.04em] text-[#48605A]">Direction des ressources humaines, Central Medical, Pillbox Hill</div>
              </div>
              <div className="w-full text-left text-[11.5px] leading-[1.8] text-[#54706A] sm:ml-auto sm:w-auto sm:text-right">
                FORM LSMS-101<br />SEPT. 2026 · PROMOTION 01<br />CONFIDENTIEL
              </div>
            </div>

            {!sent ? (
              <form onSubmit={onSubmit} noValidate>
                {/* Bandeau auth Discord */}
                <div className={`mt-6 rounded-[10px] border px-5 py-4 text-[13px] leading-[1.6] ${
                  authUser?.authenticated
                    ? "border-[rgba(30,64,175,0.25)] bg-[rgba(20,120,90,0.08)] text-[#12211E]"
                    : "border-[#B02A37] bg-[rgba(176,42,55,0.08)] text-[#8E222D]"
                }`}>
                  {authUser === null ? (
                    <span>Verification de ta session Discord…</span>
                  ) : authUser.authenticated ? (
                    <span>
                      Connecte a Discord. Ton identifiant (<code className="font-mono">{authUser.userId}</code>) sera attache au dossier.
                    </span>
                  ) : (
                    <span>
                      Tu dois te connecter avec Discord pour envoyer ta candidature.{" "}
                      <a
                        href="/api/auth/discord?returnUrl=/candidature"
                        className="font-bold underline underline-offset-2 hover:opacity-80"
                      >
                        Se connecter avec Discord &rarr;
                      </a>
                    </span>
                  )}
                </div>
                <p className="mb-3 mt-6 text-[13px] leading-[1.6] text-[#54706A]">
                  Remplissez ce dossier lisiblement, en medecin.<br /> Les champs marques <span className="text-[#8E222D]">*</span> sont obligatoires.
                </p>
                {SECTIONS.map((s) => (
                  <div key={s.title} className="mt-[38px]">
                    <div className="mb-5 flex items-center gap-3 text-[15px] font-bold uppercase tracking-[0.22em] text-[#12211E]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
                      {s.title}
                      <span className="h-px flex-1 bg-[rgba(18,33,30,0.35)]" />
                    </div>
                    <div className="grid grid-cols-1 gap-x-7 gap-y-5 sm:grid-cols-2">
                      {s.fields.map((f) => (
                        <label key={f.key} className={`block ${f.full ? "col-span-full" : ""}`}>
                          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-[#48605A]">
                            {f.label} {f.required && <span className="text-[#8E222D]">*</span>}
                          </span>
                          {f.note && <span className="mb-3 block text-[13px] leading-[1.6] text-[#54706A]">{f.note}</span>}
                          {f.type === "textarea" ? (
                            <textarea
                              rows={f.rows ?? 3}
                              value={values[f.key] ?? ""}
                              onChange={(e) => setField(f.key, e.target.value)}
                              placeholder={f.placeholder}
                              className="lsms-paper-input lsms-paper-area"
                            />
                          ) : f.type === "select" ? (
                            <select
                              value={values[f.key] ?? ""}
                              onChange={(e) => setField(f.key, e.target.value)}
                              className="lsms-paper-input"
                            >
                              <option value="">Selectionner…</option>
                              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input
                              type={f.type}
                              inputMode={f.key === "dateNaissance" ? "numeric" : undefined}
                              maxLength={f.key === "dateNaissance" ? 10 : undefined}
                              value={values[f.key] ?? ""}
                              onChange={(e) => setField(f.key, f.key === "dateNaissance" ? formatBirthDate(e.target.value) : e.target.value)}
                              placeholder={f.placeholder}
                              className="lsms-paper-input"
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-[38px]">
                  <div className="mb-5 flex items-center gap-3 text-[15px] font-bold uppercase tracking-[0.22em] text-[#12211E]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
                    Section 4 · Engagement
                    <span className="h-px flex-1 bg-[rgba(18,33,30,0.35)]" />
                  </div>
                  {CHECKS.map((c) => (
                    <label key={c.key} className="mb-3 flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!checks[c.key]}
                        onChange={(e) => setCheck(c.key, e.target.checked)}
                        className="lsms-paper-check mt-0.5 h-5 w-5 flex-none"
                      />
                      <span className="text-[14.5px] leading-[1.55] text-[#1E302C]">{c.label} <span className="text-[#8E222D]">*</span></span>
                    </label>
                  ))}
                </div>

                {draftShown && (
                  <div className="mt-6 rounded-[10px] border border-[rgba(30,64,175,0.25)] bg-[rgba(59,110,220,0.08)] px-5 py-3.5 text-[13px] text-[#1E40AF]">
                    Un brouillon sauvegarde a ete restaure sur cet appareil.
                  </div>
                )}

                {error && (
                  <div className="mt-6 border-[1.5px] border-[#B02A37] bg-[rgba(176,42,55,0.07)] px-[18px] py-3.5 text-[14px] text-[#8E222D]">{error}</div>
                )}

                <div className="mt-11 flex flex-col items-stretch gap-8 sm:flex-row sm:items-end sm:gap-10">
                  <div className="min-w-[220px] flex-1">
                    <span className="mb-[34px] block text-[11px] uppercase tracking-[0.1em] text-[#48605A]">Signature du candidat (nom complet)</span>
                    <div className="relative min-h-[40px] border-b-[2px] border-[#12211E] px-2 pb-2 pt-1" style={{
                      fontFamily: "var(--font-signature), cursive",
                      fontSize: "31px",
                      color: "#12211E",
                      fontWeight: "500",
                      letterSpacing: "0.01em",
                    }}>
                      {(values.prenom || "") && (values.nom || "") ? `${values.prenom} ${values.nom}` : ""}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      fontFamily: "var(--font-saira), sans-serif",
                      pointerEvents: sending ? "none" : "auto",
                    }}
                    className="submit-btn h-fit cursor-pointer border-none bg-[#12211E] px-10 py-[17px] text-[17px] font-bold uppercase tracking-[0.16em] text-[#EAF6F2] shadow-[0_8px_22px_rgba(0,0,0,0.35)] transition-all duration-300 hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-[#1C342F] disabled:cursor-wait disabled:opacity-55"
                  >
                    {sending ? "Transmission…" : "Deposer le dossier"}
                  </button>
                </div>
                <p className="mt-3.5 text-center text-[13px] text-[#54706A]">Votre dossier sera transmis a la direction des ressources humaines du LSMS.</p>
              </form>
            ) : (
              <div className="done-block py-[30px] text-center" style={{ animation: "fadeUp 0.45s var(--ease-out) both" }}>
                <div className="mb-6 inline-block rounded-md border-[3.5px] border-double border-[#1E40AF] px-[26px] py-3.5 text-[30px] font-bold uppercase tracking-[0.24em] text-[#1E40AF]" style={{ fontFamily: "var(--font-saira), sans-serif", transform: "rotate(-7deg)" }}>
                  Recu
                </div>
                <h2 className="mb-3.5 uppercase text-[#0D1B18]" style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: 40, fontWeight: 700 }}>
                  Candidature enregistree
                </h2>
                <p className="mb-2 text-[15px] leading-[1.7] text-[#48605A]">Votre dossier est arrive a la direction des ressources humaines du LSMS.</p>
                <p className="mb-2 text-[15px] leading-[1.7] text-[#48605A]">La reponse et votre convocation a l&apos;entretien vous parviendront sur Discord.</p>
                <p className="text-[15px] text-[#48605A]">Reference du dossier : <strong className="text-[#B91C1C]">{reference}</strong> · Delai moyen 48 h</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3.5">
                  <a href="/accueil" className="border-[1.5px] border-[#12211E] bg-[#12211E] px-[30px] py-[15px] text-[15px] font-bold uppercase tracking-[0.14em] text-[#EAF6F2] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1C342F]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
                    Retour a l&apos;accueil
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles papier : GLOBAL (pas de styled-jsx : :checked + data-URI casse) */}
      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .lsms-paper-input {
          width: 100%;
          border: 0;
          border-bottom: 1.5px solid #7FA39A;
          background: rgba(255, 255, 255, 0.45);
          font-family: var(--font-typer), "Courier New", monospace;
          font-size: 16.5px;
          color: #0D1B18;
          padding: 7px 4px 6px;
          border-radius: 0;
          caret-color: #2563EB;
          transition: border-color 0.25s var(--ease-out), background 0.25s var(--ease-out);
        }
        .lsms-paper-input:focus { outline: none; border-color: #2563EB; background: rgba(239, 246, 255, 0.9); }
        .lsms-paper-input::placeholder { color: rgba(72, 96, 90, 0.45); }
        .lsms-paper-area {
          border: 1.5px solid #7FA39A;
          background:
            repeating-linear-gradient(0deg, transparent 0px, transparent 27px, rgba(127, 163, 154, 0.4) 27px, rgba(127, 163, 154, 0.4) 28px),
            rgba(255, 255, 255, 0.45);
          line-height: 28px;
          padding: 0 6px;
          resize: vertical;
        }
        select.lsms-paper-input { cursor: pointer; }
        .lsms-paper-check {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          border: 1.5px solid #48605A;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          position: relative;
          display: grid;
          place-content: center;
          transition: all 0.2s ease-out;
        }
        .lsms-paper-check:checked {
          background-color: #2563EB;
          border-color: #2563EB;
        }
        .lsms-paper-check:checked::after {
          content: "\u2713";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #EAF6F2;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
        }
        .lsms-paper-check:focus-visible {
          outline: 2px solid #2563EB;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
