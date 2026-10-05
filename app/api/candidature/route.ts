import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";

export const runtime = "nodejs";

/**
 * POST /api/candidature — transmet le dossier LSMS au bot Modmail LSMS.
 *
 * Relais serveur-à-serveur vers MODMAIL_API_THREAD_URL (plugin api-thread du
 * bot) avec la clé partagée X-Relay-Key — même pattern que le site LSPD.
 * L'ID Discord vient EXCLUSIVEMENT du cookie OAuth (le client ne peut pas
 * le falsifier).
 */

const MODMAIL_URL = process.env.MODMAIL_API_THREAD_URL ?? "http://127.0.0.1:8788/api/thread";
const RELAY_KEY = process.env.RELAY_KEY ?? "";

const FIELD_NAME_MAX = 256;
const FIELD_VALUE_CHUNK = 1000;

type EmbedField = { name: string; value: string; inline?: boolean };
type Embed = { title?: string; description?: string; color?: number; fields?: EmbedField[]; footer?: { text?: string }; timestamp?: string };
type Payload = { reference?: string; values?: Record<string, string>; checks?: Record<string, boolean> };

function chunkText(s: string): string[] {
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += FIELD_VALUE_CHUNK) parts.push(s.slice(i, i + FIELD_VALUE_CHUNK));
  return parts;
}

/** Champs du dossier — normalises aux limites Discord (pret pour le bot). */
function buildDossierFields(values: Record<string, string>, checks: Record<string, boolean>): EmbedField[] {
  const ouiNon = (k: string) => {
    const v = (values[k] ?? "").trim();
    return v ? (v.toLowerCase() === "oui" ? "Oui" : "Non") : "";
  };
  const v = (k: string) => (values[k] ?? "").trim();
  const raw: EmbedField[] = [
    // Section 1 · Informations personnelles (RP)
    { name: "Nom", value: v("nom"), inline: true },
    { name: "Prenom", value: v("prenom"), inline: true },
    { name: "Genre", value: v("genre"), inline: true },
    { name: "Nationalite", value: v("nationalite"), inline: true },
    { name: "Date de naissance", value: v("dateNaissance"), inline: true },
    { name: "Lieu de naissance", value: v("lieuNaissance"), inline: true },
    { name: "Numero bancaire", value: v("numeroBancaire"), inline: true },
    { name: "Telephone", value: v("telephone"), inline: true },
    { name: "Situation professionnelle", value: v("situationPro"), inline: true },
    { name: "Casier judiciaire", value: ouiNon("casierJudiciaire"), inline: true },
    { name: "Permis de conduire", value: ouiNon("permisConduire"), inline: true },
    { name: "Categories permis", value: v("permisConduireInfo"), inline: true },
    { name: "Formation medicale (RP)", value: v("niveauEtudes"), inline: true },
    { name: "Adresse", value: v("adresse"), inline: false },

    // Section 2 · Questions generales (RP)
    { name: "Presentation", value: v("presentation"), inline: false },
    { name: "Experiences professionnelles", value: v("experiencesPro"), inline: false },
    { name: "Motivations", value: v("motivations"), inline: false },
    { name: "Disponibilites", value: v("disponibilites"), inline: true },

    // Section 3 · Experience roleplay (HRP)
    { name: "Experiences RP", value: v("experiencesRp"), inline: false },
    { name: "Heures de jeu FiveM", value: v("heuresJeu"), inline: true },
    { name: "Experience medical/faction", value: ouiNon("experienceMedicale"), inline: true },

    // Engagements
    {
      name: "Engagements",
      value: `Exactitude : ${checks.truth ? "attestee" : "non"} - Reglement : ${checks.agree ? "accepte" : "non"}`,
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
    return NextResponse.json({ success: false, error: "Corps de requete invalide" }, { status: 400 });
  }

  const values = body.values ?? {};
  const checks = body.checks ?? {};

  // L'ID Discord vient EXCLUSIVEMENT du cookie OAuth.
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
        error: "Authentification Discord requise. Connecte-toi via le bouton en haut du formulaire avant d'envoyer ta candidature.",
        authRequired: true,
      },
      { status: 401 }
    );
  }

  const fields = buildDossierFields(values, checks);
  const reference = (body.reference ?? "").replace(/[^\w-]/g, "").slice(0, 32);

  // Découpe en embeds respectant la limite Discord (25 champs, < 6000 chars/embed)
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
      title: isFirst ? "🩺 Nouvelle candidature — FORM LSMS-101" : "FORM LSMS-101 (suite)",
      color: 0x2563eb,
      fields: fieldsPart,
      ...(isFirst
        ? {
            description: `Dossier de **${candidateName}** reçu via le site de recrutement.\nID Discord : \`${userId}\``,
            footer: { text: `Réf. ${reference || "LSMS-XXX"} · Direction des ressources humaines · Central Medical, Pillbox Hill` },
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
    values, // passés tels quels : le plugin Modmail revalide
    checks,
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
