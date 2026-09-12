import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = 'discord_user_id';

export interface AuthCookieData {
    userId: string;
}

export function getAuthCookie(): AuthCookieData | null {
    const cookieStore = cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

    if (!authCookie?.value) {
        return null;
    }

    try {
        return {
            userId: JSON.parse(authCookie.value)
        };
    } catch {
        return null;
    }
}

export function setAuthCookie(data: AuthCookieData): void {
    const cookieStore = cookies();
    cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(data.userId));
}

export function removeAuthCookie(): void {
    const cookieStore = cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
}
