import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getAccessToken, getUserInfo, type FacebookUserDetailsResponse } from '@/lib/auth/facebook';
import db from '@/database';
import { COOKIE_SETTINGS, signJWT } from '@/lib/auth/jwt';
import { sql } from 'kysely';

function html(html: string, opts: ResponseInit = {}) {
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
        },
        ...opts,
    });
}

async function handleAuth(fbUser: FacebookUserDetailsResponse): Promise<{ id: number; display_name: string; } | Error> {
    let existing = await db
        .selectFrom('users')
        .select(['id', 'display_name'])
        .where('users.auth_type', '=', 'facebook')
        .where('users.auth_secret', '=', fbUser.id)
        .executeTakeFirst();

    if (typeof existing === 'undefined') {
        const res = await db.insertInto('users')
            .values({
                display_name: fbUser.name,
                auth_type: 'facebook',
                auth_secret: fbUser.id,
                roles: sql`'["USER"]'`,
            })
            .executeTakeFirst();

        if (typeof res.insertId === 'undefined') {
            return Error(`Failed to register user ${fbUser.name} with id ${fbUser.id}!`);
        }

        existing = {
            id: Number(res.insertId),
            display_name: fbUser.name,
        };
    }

    return existing;
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

    const user = await handleAuth(userData);
    if (user instanceof Error) {
        return html(`<pre>Registration failed: ${JSON.stringify(user.message, null, 4)}</pre>`);
    }

    // @ts-ignore
    cookies().set({
        ...COOKIE_SETTINGS,
        value: await signJWT(user),
    });

    // happy path -> frontend listens to close event
    return html('<script>window.close();</script>');
}
