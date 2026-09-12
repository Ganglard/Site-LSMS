export function getDiscordAuthUrl(returnUrl?: string) {
    const baseUrl = `https://discord.com/api/oauth2/authorize?client_id=${
        process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? ""
    }&response_type=code&scope=identify%20guilds.join`;

    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ?? "";
    const encodedRedirectUri = encodeURIComponent(redirectUri);

    // If returnUrl is provided, add it as state parameter
    const state = returnUrl ? encodeURIComponent(returnUrl) : '';
    const stateParam = state ? `&state=${state}` : '';

    return `${baseUrl}&redirect_uri=${encodedRedirectUri}${stateParam}`;
}

export function redirectToDiscordAuth(returnUrl?: string) {
    const authUrl = getDiscordAuthUrl(returnUrl);
    window.location.href = authUrl;
}
