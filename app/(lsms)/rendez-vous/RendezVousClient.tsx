"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import "../lsms.css";

const SUBMIT_ENDPOINT = "/api/rendez-vous";
const REF_PREFIX = "LSMS-RDV-";
const DRAFT_KEY = "lsms-rdv-draft";

const SERVICES = [
  "Médecine générale",
  "Chirurgie",
  "Laboratoire d'analyses",
  "Service psychologique",
  "Obstétrique",
  "Médecine légale",
];

const URGENCES = ["Non urgent", "Modéré", "Urgent"];

/** Créneaux proposés par le secrétariat (Central Medical, 08 h - 20 h). */
const SLOTS = (() => {
  const out: string[] = [];
  for (let h = 8; h <= 19; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  out.push("20:00");
  return out;
})();

type FieldKey =
  | "patientNom"
  | "telephone"
  | "specialite"
  | "medecin"
  | "dateSouhaitee"
  | "heureSouhaitee"
  | "urgence"
  | "motif"
  | "infos";

type FieldDef = {
  key: FieldKey;
  label: string;
  type: "text" | "select" | "textarea";
  options?: string[];
  placeholder?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
};

const FIELDS: FieldDef[] = [
  { key: "patientNom", label: "Nom et prénom (RP)", type: "text", placeholder: "ex. John Smith", required: true },
  { key: "telephone", label: "Téléphone", type: "text", placeholder: "ex. 555-0123" },
  { key: "specialite", label: "Service demandé", type: "select", options: SERVICES, required: true },
  { key: "medecin", label: "Médecin souhaité", type: "text", placeholder: "facultatif, ex. Dr. Reyes" },
  { key: "dateSouhaitee", label: "Date souhaitée", type: "text", placeholder: "JJ/MM/AAAA", required: true },
  { key: "heureSouhaitee", label: "Heure souhaitée", type: "select", options: SLOTS, required: true },
  { key: "urgence", label: "Niveau d'urgence", type: "select", options: URGENCES, required: true },
  {
    key: "motif",
    label: "Motif de la consultation",
    type: "textarea",
    rows: 3,
    placeholder: "Symptômes, blessures, suivi en cours…",
    required: true,
  },
  {
    key: "infos",
    label: "Informations complémentaires",
    type: "textarea",
    rows: 2,
    placeholder: "Allergies, traitement en cours, antécédents utiles au médecin (facultatif).",
  },
];

function formatDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{2})(\d{2})(\d{1,4})?/, (_, day, month, year) =>
    [day, month, year].filter(Boolean).join("/")
  );
}

export default function RendezVousClient() {
  const [values, setValues] = useState<Record<string, string>>({ urgence: "Non urgent" });
  const [truth, setTruth] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [draftShown, setDraftShown] = useState(false);
  const [authUser, setAuthUser] = useState<{ authenticated: boolean; userId: string | null } | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const cancel = useCallback(() => {
    window.location.href = "/accueil";
  }, []);

  // Vérification de la connexion Discord
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
        const v: Record<string, string> = { urgence: "Non urgent" };
        for (const f of FIELDS) if (typeof d[f.key] === "string" && d[f.key]) v[f.key] = d[f.key];
        setValues(v);
        setTruth(Boolean(d._truth));
        if (Object.keys(v).length > 1) setDraftShown(true);
      }
    } catch { /* brouillon illisible */ }
  }, []);

  // Sauvegarde du brouillon (300 ms) + effacement à l'envoi
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const persist = (v: Record<string, string>, t: boolean) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...v, _truth: t })); } catch { /* stockage plein */ }
    }, 300);
  };
  const setField = (k: FieldKey, val: string) => {
    setValues((s) => { const n = { ...s, [k]: val }; persist(n, truth); return n; });
    setError("");
  };

  // Fermeture : touche Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancel]);

  // Défilement verrouillé derrière la fenêtre
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (!sent) firstFieldRef.current?.focus();
  }, [sent]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!authUser?.authenticated) {
      setError("Connectez-vous d'abord avec Discord : votre identifiant est nécessaire pour ouvrir la demande.");
      return;
    }
    const missing = FIELDS.filter((f) => f.required && !(values[f.key] || "").trim()).map((f) => f.label);
    if (values.dateSouhaitee && !/^\d{2}\/\d{2}\/\d{4}$/.test(values.dateSouhaitee)) {
      missing.push("la date souhaitée au format JJ/MM/AAAA");
    }
    if (!truth) missing.push("l'attestation d'exactitude des informations");
    if (missing.length) {
      setError("Demande incomplète : il manque " + missing.join(", ") + ".");
      return;
    }

    const ref = REF_PREFIX + String(Date.now()).slice(-6);
    setSending(true);
    setError("");

    const payload = {
      reference: ref,
      values: Object.fromEntries(FIELDS.map((f) => [f.key, (values[f.key] ?? "").trim()])) as Record<string, string>,
      checks: { truth: true },
    };

    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || "HTTP " + res.status);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* stockage plein */ }
      setSending(false);
      setReference(ref);
      setSent(true);
    } catch (err) {
      setSending(false);
      setError(`Envoi impossible pour le moment (${err instanceof Error ? err.message : "erreur réseau"}). Réessayez dans un instant.`);
    }
  }

  const missingCount = FIELDS.filter((f) => f.required && !(values[f.key] || "").trim()).length;

  return (
    <div className="lsms-root">
      <div
        className="fixed inset-0 z-[200] overflow-y-auto bg-[rgba(3,6,12,0.78)] px-3 py-8 backdrop-blur-[3px]"
        onClick={(e) => { if (e.target === e.currentTarget) cancel(); }}
      >
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rdv-title"
          className="lsms-glass relative mx-auto w-full max-w-[540px] rounded-[18px] shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
          style={{ animation: "rdvIn 0.4s var(--ease-out) both" }}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <Image src="/lsms/emblem.png" alt="" width={26} height={26} className="h-auto w-[26px]" />
            <h1 id="rdv-title" className="m-0 flex-1 text-[19px] font-semibold tracking-[0.01em]" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
              Prise de rendez-vous
            </h1>
            <button
              type="button"
              onClick={cancel}
              aria-label="Fermer"
              className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full text-[rgba(235,245,242,0.6)] transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
              </svg>
            </button>
          </div>

          {sent ? (
            <div className="px-5 py-8 text-center">
              <div className="mb-5 inline-block rounded-md border-[3px] border-double border-[#9FC6F5] px-5 py-2.5 text-[20px] font-bold uppercase tracking-[0.22em] text-[#9FC6F5]" style={{ fontFamily: "var(--font-saira), sans-serif", transform: "rotate(-6deg)" }}>
                Transmise
              </div>
              <h2 className="mb-3 text-[24px] font-bold" style={{ fontFamily: "var(--font-saira), sans-serif" }}>
                Demande enregistrée
              </h2>
              <p className="mx-auto mb-2 max-w-[400px] text-[15px] leading-[1.65] text-[rgba(235,245,242,0.72)]">
                Votre demande est arrivée au secrétariat médical du LSMS. Un médecin confirmera le créneau dans votre conversation Discord.
              </p>
              <p className="text-[15px] text-[rgba(235,245,242,0.72)]">
                Référence : <strong className="text-[#9FC6F5]">{reference}</strong>
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <a href="/accueil" className="lsms-cta">Retour à l&apos;accueil</a>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="max-h-[62vh] overflow-y-auto px-5 py-4">
                <div className="rounded-[10px] border border-[#E0A020] bg-[rgba(224,160,32,0.10)] px-4 py-3 text-[13px] leading-[1.55] text-[#F0C674]">
                  Ce formulaire sera transmis au secrétariat médical du LSMS. Ne donne pas de mot de passe ni toute autre information sensible.
                </div>

                <div className={`mt-4 rounded-[10px] border px-4 py-3 text-[13px] leading-[1.55] ${
                  authUser?.authenticated
                    ? "border-[rgba(59,110,220,0.35)] bg-[rgba(59,110,220,0.10)] text-[rgba(235,245,242,0.85)]"
                    : "border-[#e23b4e] bg-[rgba(226,59,78,0.10)] text-[#F3A9B2]"
                }`}>
                  {authUser === null ? (
                    <span>Vérification de votre session Discord…</span>
                  ) : authUser.authenticated ? (
                    <span>
                      Connecté à Discord. Votre identifiant (<code className="font-mono">{authUser.userId}</code>) sera joint à la demande.
                    </span>
                  ) : (
                    <span>
                      Vous devez vous connecter avec Discord pour envoyer une demande.{" "}
                      <a href="/api/auth/discord?returnUrl=/rendez-vous" className="font-bold underline underline-offset-2 hover:opacity-80">
                        Se connecter avec Discord
                      </a>
                    </span>
                  )}
                </div>

                <p className="mb-1 mt-5 text-[12.5px] leading-[1.6] text-[rgba(235,245,242,0.6)]">
                  Remplissez les champs ci-dessous. Les champs marqués <span className="text-[#F3A9B2]">*</span> sont obligatoires.
                </p>

                <div className="mt-4 flex flex-col gap-4">
                  {FIELDS.map((f, i) => (
                    <label key={f.key} className="block">
                      <span className="mb-1.5 block text-[12.5px] text-[rgba(235,245,242,0.72)]">
                        {f.label} {f.required && <span className="text-[#F3A9B2]">*</span>}
                      </span>
                      {f.type === "textarea" ? (
                        <textarea
                          rows={f.rows ?? 3}
                          value={values[f.key] ?? ""}
                          onChange={(e) => setField(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className="rdv-input rdv-area"
                        />
                      ) : f.type === "select" ? (
                        <select
                          value={values[f.key] ?? ""}
                          onChange={(e) => setField(f.key, e.target.value)}
                          className="rdv-input rdv-select"
                        >
                          <option value="">Sélectionner…</option>
                          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          ref={i === 0 ? firstFieldRef : undefined}
                          type="text"
                          inputMode={f.key === "dateSouhaitee" ? "numeric" : undefined}
                          maxLength={f.key === "dateSouhaitee" ? 10 : undefined}
                          value={values[f.key] ?? ""}
                          onChange={(e) => setField(f.key, f.key === "dateSouhaitee" ? formatDate(e.target.value) : e.target.value)}
                          placeholder={f.placeholder}
                          className="rdv-input"
                        />
                      )}
                    </label>
                  ))}
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={truth}
                    onChange={(e) => { setTruth(e.target.checked); persist(values, e.target.checked); setError(""); }}
                    className="rdv-check mt-0.5 h-5 w-5 flex-none"
                  />
                  <span className="text-[13.5px] leading-[1.5] text-[rgba(235,245,242,0.8)]">
                    Les informations fournies sont exactes. <span className="text-[#F3A9B2]">*</span>
                  </span>
                </label>

                {draftShown && (
                  <div className="mt-4 rounded-[10px] border border-[rgba(59,110,220,0.35)] bg-[rgba(59,110,220,0.10)] px-4 py-2.5 text-[12.5px] text-[#9FC6F5]">
                    Un brouillon sauvegardé a été restauré sur cet appareil.
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-[10px] border border-[#e23b4e] bg-[rgba(226,59,78,0.10)] px-4 py-3 text-[13.5px] leading-[1.5] text-[#F3A9B2]">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
                <span className="flex-1 text-[12px] text-[rgba(235,245,242,0.45)]">
                  {missingCount > 0 ? `${missingCount} champ(s) obligatoire(s) à compléter` : "Formulaire complet"}
                </span>
                <button
                  type="button"
                  onClick={cancel}
                  className="cursor-pointer rounded-[10px] border border-white/15 bg-white/[0.06] px-5 py-2.5 text-[14px] font-medium text-[rgba(235,245,242,0.85)] transition-colors duration-200 hover:bg-white/[0.12]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="cursor-pointer rounded-[10px] border-none bg-[#2563EB] px-6 py-2.5 text-[14px] font-semibold text-white transition-all duration-200 hover:not-disabled:bg-[#3B7BF0] disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? "Envoi…" : "Envoyer"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes rdvIn { from { opacity: 0; transform: translateY(14px) scale(0.985); } to { opacity: 1; transform: none; } }
        .rdv-input {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          font-size: 15px;
          color: var(--lsms-text);
          padding: 10px 12px;
          transition: border-color 0.2s var(--ease-out), background 0.2s var(--ease-out);
        }
        .rdv-input::placeholder { color: rgba(235, 245, 242, 0.35); }
        .rdv-input:focus { outline: none; border-color: #2563EB; background: rgba(37, 99, 235, 0.08); }
        .rdv-select { cursor: pointer; }
        .rdv-select option { background: #0b1220; color: var(--lsms-text); }
        .rdv-area { resize: vertical; line-height: 1.5; }
        .rdv-check {
          appearance: none;
          -webkit-appearance: none;
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          cursor: pointer;
          position: relative;
          display: grid;
          place-content: center;
          transition: all 0.2s var(--ease-out);
        }
        .rdv-check:checked { background-color: #2563EB; border-color: #2563EB; }
        .rdv-check:checked::after {
          content: "\\u2713";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
        }
        .rdv-check:focus-visible { outline: 2px solid #93C5FD; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
