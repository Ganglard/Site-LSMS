import { DiscordTokenResponse, DiscordUser, AuthError } from './types';

export class DiscordService {
    private static instance: DiscordService;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly botToken: string;
    private readonly guildId: string;

    private constructor() {
        this.clientId = process.env.DISCORD_CLIENT_ID || '';
        this.clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
        this.redirectUri = process.env.DISCORD_REDIRECT_URI || '';
        this.botToken = process.env.DISCORD_BOT_TOKEN || '';
        this.guildId = process.env.DISCORD_GUILD_ID || '';

        if (!this.clientId || !this.clientSecret || !this.redirectUri) {
            throw new Error('Missing required Discord configuration');
        }
    }

    public static getInstance(): DiscordService {
        if (!DiscordService.instance) {
            DiscordService.instance = new DiscordService();
        }
        return DiscordService.instance;
    }

    async getAccessToken(code: string): Promise<DiscordTokenResponse> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            scope: 'identify guilds.join',
        });

        const response = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (!response.ok || !data.access_token) {
            throw new AuthError('Failed to obtain access token', response.status, data);
        }

        return data as DiscordTokenResponse;
    }

    async getUserData(accessToken: string): Promise<DiscordUser> {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new AuthError('Failed to fetch user data', response.status, data);
        }

        return data as DiscordUser;
    }

    async addUserToGuild(userId: string, accessToken: string): Promise<void> {
        // Si le bot token ou le guild ID ne sont pas configures, on skip
        if (!this.botToken || !this.guildId) {
            console.warn("[discord-service] addUserToGuild skip: BOT_TOKEN ou GUILD_ID manquant");
            return;
        }
        const response = await fetch(
            `https://discord.com/api/guilds/${this.guildId}/members/${userId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bot ${this.botToken}`,
                },
                body: JSON.stringify({
                    access_token: accessToken,
                }),
            }
        );

        if (!response.ok) {
            const errorDetails = await response.json();
            throw new AuthError('Failed to add user to guild', response.status, errorDetails);
        }
    }
}
