import { NextRequest, NextResponse } from 'next/server';
import { FacebookAuth, handleFacebookAuth } from '@/lib/auth/handler/facebook';
import { SessionReader, SessionWriter } from '@/lib/auth/session';
import { UsersRepository } from '@/lib/repositories';
import { sql } from 'kysely';

function html(html: string, { headers, ...opts }: ResponseInit = {}) {
    headers = headers ?? {};

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
            ...headers,
        },
        ...opts,
    });
}

// /login/fb-success
export async function handleFacebookLogin(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    const loginResolver = new FacebookAuth(url.href.replace(url.search, ''));
    const facebookUser = await loginResolver.accept(req);

    if ('error' in facebookUser) {
        return html(`<pre>Nepodařilo se přihlásit.<br />${facebookUser.error?.message}</pre>`);
    }

    const persistentUser = await handleFacebookAuth(facebookUser);

    if (persistentUser instanceof Error) {
        return html(
            `<pre>Registration failed: ${JSON.stringify(persistentUser.message, null, 4)}</pre>`,
        );
    }

    // happy path -> frontend listens to close event
    return await new SessionWriter()
        .setData(persistentUser)
        .inject(html('<script>window.close();</script>'));
}

// /login/verify
export async function handleVerifyLogin(req: NextRequest): Promise<NextResponse> {
    const reader = await SessionReader.fromRequest(req);

    if (!reader.isValid) {
        return await new SessionWriter()
            .deleteSession()
            .inject(
                NextResponse.redirect(
                    new URL(
                        '/login',
                        `${req.nextUrl.protocol}/${req.nextUrl.host}${req.nextUrl.pathname}`,
                    ),
                ),
            );
    }

    const exists = await UsersRepository.selectQb()
        .select(sql<number>`COUNT(*)`.as('count'))
        .where('id', '=', reader.userId)
        .executeTakeFirst();

    if (!exists || exists.count < 1) {
        return await new SessionWriter()
            .deleteSession()
            .inject(NextResponse.redirect(new URL('/login', req.url)));
    }

    const next = new URL(req.url).searchParams.get('next');
    const response = NextResponse.redirect(next ? decodeURIComponent(next) : new URL('/', req.url));

    return await new SessionWriter().setData(reader.session).inject(response);
}

// /logout
export async function handleLogout(req: NextRequest): Promise<NextResponse> {
    return await new SessionWriter()
        .deleteSession()
        .inject(NextResponse.redirect(new URL('/login', req.url)));
}
