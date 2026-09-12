import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/discord?returnUrl=/candidature
 * Démarre le flow OAuth Discord (identify + guilds.join) et revient sur returnUrl.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? process.env.DISCORD_CLIENT_ID ?? "";
  const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ?? process.env.DISCORD_REDIRECT_URI ?? "";
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { success: false, error: "OAuth Discord non configuré (NEXT_PUBLIC_DISCORD_CLIENT_ID / NEXT_PUBLIC_DISCORD_REDIRECT_URI)" },
      { status: 500 }
    );
  }
  const returnUrl = req.nextUrl.searchParams.get("returnUrl") ?? "";
  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify guilds.join");
  url.searchParams.set("redirect_uri", redirectUri);
  if (returnUrl) url.searchParams.set("state", encodeURIComponent(returnUrl));
  url.searchParams.set("prompt", "consent");
  return NextResponse.redirect(url.toString(), 302);
}
