import type { NextRequest } from 'next/server';
import { getAccessToken, getUserInfo, handleFacebookAuth } from '@/lib/auth/facebook';
import { createSessionCookie } from '@/lib/auth/session';
import { cookies } from 'next/headers';

function html(html: string, { headers, ...opts }: ResponseInit = {}) {
    headers = headers ?? {};

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
            ...headers,
        },
        ...opts,
    });
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return html('<pre>Facebook login failed.</pre>');
    }

    const tok = await getAccessToken(code, url.href.replace(url.search, ''));
    if ('error' in tok) {
        return html(
            `<pre>Facebook login failed.</pre><pre>Caused by: ${JSON.stringify(
                tok.error.message,
                null,
                4,
            )}</pre>`,
        );
    }

    const userData = await getUserInfo(tok.access_token);
    if ('error' in userData) {
        return html(
            `<pre>Facebook login failed.</pre><pre>Caused by: ${JSON.stringify(
                userData.error.message,
                null,
                4,
            )}</pre>`,
        );
    }

    const persistentUser = await handleFacebookAuth(userData);
    if (persistentUser instanceof Error) {
        return html(
            `<pre>Registration failed: ${JSON.stringify(persistentUser.message, null, 4)}</pre>`,
        );
    }

    const authCookie = await createSessionCookie(persistentUser);

    // @ts-ignore debilové
    cookies().set(authCookie);

    // happy path -> frontend listens to close event
    return html('<script>window.close();</script>');
}
