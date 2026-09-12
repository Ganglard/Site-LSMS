export interface DiscordTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email?: string;
}

export class AuthError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 400,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = 'AuthError';
    }
}
