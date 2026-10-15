import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";

export const runtime = "nodejs";

/**
 * POST /api/rendez-vous : transmet une demande de rendez-vous médical au bot Modmail LSMS.
 *
 * Relais serveur à serveur protégé par X-Relay-Key, vers l'endpoint /api/appointment du
 * plugin appointments-plugin.js (port 8788, funnel Tailscale :8443).
 * L'ID Discord du patient vient uniquement du cookie OAuth.
 */

const THREAD_URL = process.env.MODMAIL_API_THREAD_URL ?? "http://127.0.0.1:8788/api/thread";
const APPOINTMENT_URL = process.env.MODMAIL_APPOINTMENT_URL ?? THREAD_URL.replace(/\/api\/thread$/, "/api/appointment");
// Le bot rendez-vous est une instance dédiée : il peut avoir sa propre clé de relais.
// À défaut, la clé du bot candidatures (RELAY_KEY) est utilisée.
const RELAY_KEY = process.env.MODMAIL_APPOINTMENT_RELAY_KEY || process.env.RELAY_KEY || "";

const FIELD_NAME_MAX = 256;
const FIELD_VALUE_CHUNK = 1000;

type EmbedField = { name: string; value: string; inline?: boolean };
type Embed = { title?: string; description?: string; color?: number; fields?: EmbedField[]; footer?: { text?: string }; timestamp?: string };

type Payload = {
  reference?: string;
  values?: Record<string, string>;
  checks?: Record<string, boolean>;
};

/** Champs de la demande, découpés selon les limites de Discord. */
function buildAppointmentFields(values: Record<string, string>, checks: Record<string, boolean>): EmbedField[] {
  const v = (k: string) => (values[k] ?? "").trim();
  const urgence = v("urgence");
  const urgenceBadge = /^urgent/i.test(urgence)
    ? "🚨 Urgent"
    : /^mod[ée]r[ée]/i.test(urgence)
      ? "⚠️ Modéré"
      : /^non\s*urgent/i.test(urgence)
        ? "🟢 Non urgent"
        : urgence;

  const raw: EmbedField[] = [
    { name: "Patient", value: v("patientNom"), inline: true },
    { name: "Téléphone", value: v("telephone"), inline: true },
    { name: "Service demandé", value: v("specialite"), inline: true },
    { name: "Médecin souhaité", value: v("medecin"), inline: true },
    { name: "Date souhaitée", value: v("dateSouhaitee"), inline: true },
    { name: "Heure souhaitée", value: v("heureSouhaitee"), inline: true },
    { name: "Niveau d'urgence", value: urgenceBadge, inline: true },
    { name: "▸ Motif de la consultation", value: v("motif"), inline: false },
    { name: "▸ Informations complémentaires", value: v("infos"), inline: false },
    { name: "▸ Engagements", value: `Exactitude des informations : ${checks.truth ? "✅ attestée" : "❌ non attestée"}`, inline: false },
  ];

  const out: EmbedField[] = [];
  for (const f of raw) {
    if (!f.value.trim()) continue;
    const baseName = f.name.slice(0, FIELD_NAME_MAX);
    const parts: string[] = [];
    for (let i = 0; i < f.value.length; i += FIELD_VALUE_CHUNK) parts.push(f.value.slice(i, i + FIELD_VALUE_CHUNK));
    parts.forEach((p, i) => {
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
  const checks = { truth: Boolean(body.checks?.truth) };

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
        error: "Authentification Discord requise. Connectez-vous via le bouton en haut du formulaire avant d'envoyer votre demande.",
        authRequired: true,
      },
      { status: 401 }
    );
  }

  const missing: string[] = [];
  const labels: [string, string][] = [
    ["patientNom", "Nom du patient"],
    ["specialite", "Service demandé"],
    ["dateSouhaitee", "Date souhaitée"],
    ["heureSouhaitee", "Heure souhaitée"],
    ["motif", "Motif de la consultation"],
  ];
  for (const [key, label] of labels) if (!(values[key] ?? "").trim()) missing.push(label);
  if (missing.length) {
    return NextResponse.json({ success: false, error: `Demande incomplète : ${missing.join(", ")}.` }, { status: 400 });
  }
  const date = (values.dateSouhaitee ?? "").trim();
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return NextResponse.json({ success: false, error: "La date souhaitée doit être au format JJ/MM/AAAA." }, { status: 400 });
  }
  if (!checks.truth) {
    return NextResponse.json({ success: false, error: "Vous devez attester que les informations fournies sont exactes." }, { status: 400 });
  }

  const reference = (body.reference ?? "").replace(/[^\w-]/g, "").slice(0, 32);
  const patientName = (values.patientNom ?? "").trim() || "Patient";
  const fields = buildAppointmentFields(values, checks);

  // Découpe en embeds (limites Discord : 25 champs, 6000 caractères)
  const embedLen = (e: Embed) =>
    (e.title ?? "").length + (e.description ?? "").length +
    (e.footer?.text ?? "").length +
    (e.fields ?? []).reduce((n, f) => n + f.name.length + f.value.length, 0);

  const embeds: Embed[] = [];
  let cur: EmbedField[] = [];
  let curLen = 0;
  const pushEmbed = (part: EmbedField[], isFirst: boolean) => {
    embeds.push({
      title: isFirst ? "🗓️ Nouvelle demande de rendez-vous médical" : "🗓️ Demande de rendez-vous (suite)",
      color: /🚨/.test(values.urgence ?? "") ? 0xb91c1c : 0x2563eb,
      fields: part,
      ...(isFirst
        ? {
            description: `Demande de **${patientName}** reçue via le site du LSMS.\nID Discord : \`${userId}\``,
            footer: { text: `Réf. ${reference || "LSMS-RDV-XXX"} · Consultations · Central Medical, Pillbox Hill` },
            timestamp: new Date().toISOString(),
          }
        : {}),
    });
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
    kind: "appointment",
    userId,
    reference,
    patient_name: patientName,
    values,
    checks,
    embeds, // repli : si le bot ne reconstruit pas l'embed, celui-ci reste exploitable
  };

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    const upstream = await fetch(APPOINTMENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Relay-Key": RELAY_KEY },
      body: JSON.stringify(modmailBody),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));

    const data = (await upstream.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
      threadId?: string;
      dmBlocked?: boolean;
      existing?: boolean;
    };

    // 409 = le patient avait déjà un fil ouvert : la demande y a été ajoutée (succès)
    if (upstream.status === 409 && data.success !== false) {
      return NextResponse.json({ success: true, threadId: data.threadId, existing: true });
    }
    if (!upstream.ok || data.success === false) {
      return NextResponse.json(
        { success: false, error: data.error || `Le service de consultations a refusé la demande (HTTP ${upstream.status})` },
        { status: upstream.status === 401 ? 502 : upstream.status }
      );
    }
    return NextResponse.json({ success: true, threadId: data.threadId, dmBlocked: Boolean(data.dmBlocked) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, error: `Service de consultations injoignable (${msg}). Le bot est-il lancé ?` },
      { status: 502 }
    );
  }
}
