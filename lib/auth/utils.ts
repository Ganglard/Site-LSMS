export function getOAuthParams(request: Request) {
    const url = new URL(request.url);
    return {
        code: url.searchParams.get("code"),
        state: url.searchParams.get("state"),
    };
}

export function validateAuthCode(code: string | null): asserts code is string {
    if (!code) {
        throw new Error('Missing code parameter');
    }
}
