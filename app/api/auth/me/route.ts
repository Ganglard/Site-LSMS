import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auth/me — état de connexion Discord pour le formulaire. */
export async function GET() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  let userId = "";
  if (authCookie?.value) {
    try {
      userId = String(JSON.parse(authCookie.value) ?? "");
    } catch {
      userId = String(authCookie.value);
    }
  }
  const authenticated = /^\d{17,20}$/.test(userId);
  return NextResponse.json(
    { authenticated, userId: authenticated ? userId : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
