import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

/**
 * POST /api/candidature — enregistre le dossier LSMS.
 *
 * Etat actuel : PAS de bot Discord. Le dossier est stocke en local dans
 * `candidatures/` (JSON horodate + reference). L'ID Discord vient
 * EXCLUSIVEMENT du cookie OAuth (le client ne peut pas le falsifier).
 *
 * Branchement bot plus tard : remplacer le bloc "STOCKAGE LOCAL" par le
 * POST vers MODMAIL_API_THREAD_URL avec X-Relay-Key (meme pattern que le
 * site LSPD : site-lspa/app/api/candidature/route.ts).
 */

const DATA_DIR = path.join(process.cwd(), "candidatures");

const FIELD_NAME_MAX = 256;
const FIELD_VALUE_CHUNK = 1000;

type EmbedField = { name: string; value: string; inline?: boolean };
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
  const candidateName = `${(values.prenom ?? "").trim()} ${(values.nom ?? "").trim()}`.trim() || "Candidat";

  // ----- STOCKAGE LOCAL (a remplacer par le POST ModMail quand le bot existe) -----
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const record = {
      reference: reference || `LSMS-${Date.now().toString().slice(-6)}`,
      receivedAt: new Date().toISOString(),
      discordId: userId,
      candidateName,
      fields,
      values,
      checks,
    };
    await fs.writeFile(
      path.join(DATA_DIR, `${record.reference}.json`),
      JSON.stringify(record, null, 2),
      "utf8"
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, error: `Enregistrement impossible (${msg})` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, reference });
}
