import { cookies } from "next/headers";
import { DiscordService } from "@/lib/auth/discord-service";
import { AuthError } from "@/lib/auth/types";
import { getOAuthParams, validateAuthCode } from "@/lib/auth/utils";
import { setAuthCookie } from "@/lib/auth/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { code } = getOAuthParams(req);
        validateAuthCode(code);

        const cookieStore = cookies();
        const discord = DiscordService.getInstance();

        // 1) Exchange code for access token
        console.log("[oauth-callback] exchanging code for token...");
        const tokenData = await discord.getAccessToken(code);
        console.log("[oauth-callback] token obtained, fetching user data...");

        // 2) Get user data
        const userData = await discord.getUserData(tokenData.access_token);
        console.log(`[oauth-callback] user obtained: ${userData.id}`);

        // 3) Add user to guild (best-effort : ne plante pas le flow si ça échoue)
        try {
            await discord.addUserToGuild(userData.id, tokenData.access_token);
            console.log(`[oauth-callback] user ${userData.id} added to guild`);
        } catch (guildErr) {
            console.warn(
                `[oauth-callback] addUserToGuild failed (non-bloquant): ` +
                (guildErr instanceof Error ? guildErr.message : String(guildErr))
            );
        }

        // 4) Set user cookie
        setAuthCookie({ userId: userData.id });
        console.log(`[oauth-callback] cookie set for ${userData.id}`);

        // Get the return URL from the state parameter or use default
        const { state } = getOAuthParams(req);
        let returnPath = state ? decodeURIComponent(state) : (process.env.REDIRECT_URL ?? '/candidature');
        // Si c'est un chemin relatif, le transformer en URL absolue pour Response.redirect
        if (returnPath.startsWith('/')) {
            const baseUrl = new URL(req.url).origin;
            returnPath = baseUrl + returnPath;
        }
        return Response.redirect(returnPath, 302);

    } catch (error) {
        console.error("[oauth-callback] ERREUR:", error);
        if (error instanceof Error) {
            console.error("[oauth-callback] Stack:", error.stack);
        }
        if (error instanceof AuthError) {
            return new Response(
                JSON.stringify({ error: error.message, details: error.details }),
                {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
