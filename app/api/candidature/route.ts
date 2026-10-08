import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";

export const runtime = "nodejs";

/**
 * POST /api/candidature : transmet le dossier au bot Modmail LSMS.
 *
 * Relais serveur à serveur vers MODMAIL_API_THREAD_URL, protégé par la clé
 * X-Relay-Key. L'ID Discord vient uniquement du cookie OAuth.
 */

const MODMAIL_URL = process.env.MODMAIL_API_THREAD_URL ?? "http://127.0.0.1:8788/api/thread";
const RELAY_KEY = process.env.RELAY_KEY ?? "";

const FIELD_NAME_MAX = 256;
const FIELD_VALUE_CHUNK = 1000;

type EmbedField = { name: string; value: string; inline?: boolean };
type Embed = { title?: string; description?: string; color?: number; fields?: EmbedField[]; footer?: { text?: string }; timestamp?: string };
type Payload = { reference?: string; values?: Record<string, string>; checks?: Record<string, boolean>; preview?: string | null };

/** Aperçu JPEG de la feuille (data URL) : accepté seulement s'il est bien un JPEG raisonnable. */
const PREVIEW_MAX_CHARS = 4_000_000;
function cleanPreview(p: unknown): string | null {
  if (typeof p !== "string" || p.length > PREVIEW_MAX_CHARS) return null;
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(p);
  if (!m) return null;
  return m[1].startsWith("/9j/") ? m[1] : null; // signature JPEG (FF D8 FF)
}

function chunkText(s: string): string[] {
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += FIELD_VALUE_CHUNK) parts.push(s.slice(i, i + FIELD_VALUE_CHUNK));
  return parts;
}

/** Champs du dossier, découpés selon les limites de Discord. */
function buildDossierFields(values: Record<string, string>, checks: Record<string, boolean>): EmbedField[] {
  const ouiNon = (k: string) => {
    const v = (values[k] ?? "").trim();
    return v ? (v.toLowerCase() === "oui" ? "Oui" : "Non") : "";
  };
  const v = (k: string) => (values[k] ?? "").trim();
  const raw: EmbedField[] = [
    { name: "Nom", value: v("nom"), inline: true },
    { name: "Prénom", value: v("prenom"), inline: true },
    { name: "Genre", value: v("genre"), inline: true },
    { name: "Nationalité", value: v("nationalite"), inline: true },
    { name: "Date de naissance", value: v("dateNaissance"), inline: true },
    { name: "Lieu de naissance", value: v("lieuNaissance"), inline: true },
    { name: "Numéro bancaire", value: v("numeroBancaire"), inline: true },
    { name: "Téléphone", value: v("telephone"), inline: true },
    { name: "Situation professionnelle", value: v("situationPro"), inline: true },
    { name: "Casier judiciaire", value: ouiNon("casierJudiciaire"), inline: true },
    { name: "Permis de conduire", value: ouiNon("permisConduire"), inline: true },
    { name: "Catégories permis", value: v("permisConduireInfo"), inline: true },
    { name: "Formation médicale (RP)", value: v("niveauEtudes"), inline: true },
    { name: "Adresse", value: v("adresse"), inline: false },

    { name: "Présentation", value: v("presentation"), inline: false },
    { name: "Expériences professionnelles", value: v("experiencesPro"), inline: false },
    { name: "Motivations", value: v("motivations"), inline: false },
    { name: "Disponibilités", value: v("disponibilites"), inline: true },

    { name: "Expériences RP", value: v("experiencesRp"), inline: false },
    { name: "Heures de jeu FiveM", value: v("heuresJeu"), inline: true },
    { name: "Expérience médicale ou faction", value: ouiNon("experienceMedicale"), inline: true },

    {
      name: "Engagements",
      value: `Exactitude : ${checks.truth ? "attestée" : "non"}. Règlement : ${checks.agree ? "accepté" : "non"}`,
      inline: false,
    },
  ];
  const out: EmbedField[] = [];
  for (const f of raw) {
    const baseName = f.name.slice(0, FIELD_NAME_MAX);
    if (!f.value.trim()) continue;
    chunkText(f.value).forEach((p, i) => {
      out.push({
        name: i === 0 ? baseName : `${baseName} (suite ${i + 1})`.slice(0, FIELD_NAME_MAX),
        value: p,
        inline: i === 0 ? f.inline : false,
      });
    });
  }
  return out;
}

export async function POST(req: NextRequest) {
  if (!RELAY_KEY) {
    return NextResponse.json(
      { success: false, error: "Relais non configuré : RELAY_KEY absente du serveur (.env.local)" },
      { status: 500 }
    );
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps de requête invalide" }, { status: 400 });
  }

  const values = body.values ?? {};
  const checks = body.checks ?? {};

  // L'ID Discord vient uniquement du cookie OAuth.
  let userId = "";
  try {
    const authCookie = cookies().get(AUTH_COOKIE_NAME);
    if (authCookie?.value) {
      const parsed = JSON.parse(authCookie.value);
      userId = typeof parsed === "string" ? parsed : parsed?.userId ?? "";
    }
  } catch {
    userId = "";
  }
  userId = String(userId).trim();
  if (!/^\d{17,20}$/.test(userId)) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentification Discord requise. Connectez-vous via le bouton en haut du formulaire avant d'envoyer votre candidature.",
        authRequired: true,
      },
      { status: 401 }
    );
  }

  const fields = buildDossierFields(values, checks);
  const reference = (body.reference ?? "").replace(/[^\w-]/g, "").slice(0, 32);

  // Découpe en embeds (limites Discord : 25 champs, 6000 caractères)
  const candidateName = `${(values.prenom ?? "").trim()} ${(values.nom ?? "").trim()}`.trim() || "Candidat";
  const embedLen = (e: Embed) =>
    (e.title ?? "").length + (e.description ?? "").length +
    (e.footer?.text ?? "").length +
    (e.fields ?? []).reduce((n, f) => n + f.name.length + f.value.length, 0);

  const embeds: Embed[] = [];
  let cur: EmbedField[] = [];
  let curLen = 0;
  const pushEmbed = (fieldsPart: EmbedField[], isFirst: boolean) => {
    const base: Embed = {
      title: isFirst ? "Nouvelle candidature, FORM LSMS-101" : "FORM LSMS-101 (suite)",
      color: 0x2563eb,
      fields: fieldsPart,
      ...(isFirst
        ? {
            description: `Dossier de **${candidateName}** reçu via le site de recrutement.\nID Discord : \`${userId}\``,
            footer: { text: `Réf. ${reference || "LSMS-XXX"} , Direction des ressources humaines, Central Medical, Pillbox Hill` },
            timestamp: new Date().toISOString(),
          }
        : {}),
    };
    embeds.push(base);
  };
  for (const f of fields) {
    const L = f.name.length + f.value.length;
    if (cur.length >= 25 || (cur.length && curLen + L > 5600)) {
      pushEmbed(cur, embeds.length === 0);
      cur = [];
      curLen = 0;
    }
    cur.push(f);
    curLen += L;
  }
  if (cur.length) pushEmbed(cur, embeds.length === 0);

  const modmailBody = {
    userId,
    reference,
    candidate_name: candidateName,
    values, // le plugin Modmail revalide les valeurs
    checks,
    preview: cleanPreview(body.preview), // base64 JPEG, attaché à l\'embed par le bot
  };

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    const upstream = await fetch(MODMAIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Relay-Key": RELAY_KEY },
      body: JSON.stringify(modmailBody),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));

    const data = (await upstream.json().catch(() => ({}))) as { success?: boolean; error?: string; threadId?: string; dmBlocked?: boolean; existing?: boolean };

    // 409 = le candidat avait déjà un thread ouvert : le dossier y a été ajouté (succès)
    if (upstream.status === 409 && data.success !== false) {
      return NextResponse.json({ success: true, threadId: data.threadId, existing: true });
    }
    if (!upstream.ok || data.success === false) {
      return NextResponse.json(
        { success: false, error: data.error || `Le bureau des ressources humaines a refusé le dossier (HTTP ${upstream.status})` },
        { status: upstream.status === 401 ? 502 : upstream.status }
      );
    }
    return NextResponse.json({ success: true, threadId: data.threadId, dmBlocked: Boolean(data.dmBlocked) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, error: `Bureau des ressources humaines injoignable (${msg}). Le bot est-il lancé ?` },
      { status: 502 }
    );
  }
}
