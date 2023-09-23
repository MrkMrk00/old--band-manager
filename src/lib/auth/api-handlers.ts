import { sql } from 'kysely';
import type { NextRequest, NextResponse } from 'next/server';
import DatabaseAuthHandler, { ensureAdminUser } from '@/lib/auth/handler/email';
import { FacebookAuth, handleRegisterFacebookUser } from '@/lib/auth/handler/facebook';
import { JWTSession, SessionReader, SessionWriter } from '@/lib/auth/session';
import response from '@/lib/http/response';
import { UsersRepository } from '@/lib/repositories';

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;
const routes = new Map<string, RouteHandler>();

/**
 * Function decorator - register handler for a route /login/{handler}
 * @param endpoint
 * @param handler
 */
function route(endpoint: string, handler: RouteHandler): void {
    routes.set(endpoint, handler);
}

export default async function authApiHandler(
    request: NextRequest,
    { params }: { params: Record<string, string> },
): Promise<NextResponse> {
    const { handler } = params;

    const handlerFunc = routes.get(handler);

    if (!handlerFunc) {
        return Promise.resolve(response().notFound().build());
    }

    return await handlerFunc(request);
}

route('form', async function (req: NextRequest): Promise<NextResponse> {
    await ensureAdminUser();

    const user = await new DatabaseAuthHandler().accept(req);
    if (!user) {
        const url = new URL('/login', req.url);
        url.searchParams.append('err_str', 'Špatné přihlašovací údaje.');

        return response().redirectPost(url).build();
    }

    return await new SessionWriter()
        .setData(user.toPersistentUser())
        .inject(r => r.redirectPost('/'));
});

async function handleRedirectionFacebookAuth(req: NextRequest): Promise<NextResponse> {
    const url = req.nextUrl;

    const loginResolver = new FacebookAuth(url.href.replace(url.search, ''));
    const facebookUser = await loginResolver.accept(req);

    if ('error' in facebookUser) {
        return response()
            .redirect('/login')
            .errStr(`Nepodařilo se přihlásit. ${facebookUser.error?.message}`)
            .build();
    }

    const persistentUser = await handleRegisterFacebookUser(facebookUser);

    if ('error' in persistentUser) {
        return response()
            .redirect('/login')
            .errStr(
                `Chyba v registraci uživatele: ${JSON.stringify(persistentUser.message, null, 4)}`,
            )
            .build();
    }

    const session = new JWTSession();
    session.userId = persistentUser.id;
    session.displayName = persistentUser.display_name;
    const cookie = await session.cookie();

    if ('error' in cookie) {
        return response().redirect('/login').errStr(cookie.message).build();
    }

    return response().redirect('/').pushCookie(cookie).build();
}

route('fb-success', async function (req: NextRequest) {
    const state = req.nextUrl.searchParams.get('state');
    if (state && state === 'redirect') {
        return await handleRedirectionFacebookAuth(req);
    }

    const url = new URL(req.url);

    const loginResolver = new FacebookAuth(url.href.replace(url.search, ''));
    const facebookUser = await loginResolver.accept(req);

    if ('error' in facebookUser) {
        return response()
            .html(`<pre>Nepodařilo se přihlásit.<br />${facebookUser.error?.message}</pre>`)
            .build();
    }

    const persistentUser = await handleRegisterFacebookUser(facebookUser);

    if ('error' in persistentUser) {
        return response()
            .html(
                `<pre>Registration failed: ${JSON.stringify(
                    persistentUser.message,
                    null,
                    4,
                )}</pre>`,
            )
            .build();
    }

    // happy path -> frontend listens to close event
    return await new SessionWriter()
        .setData(persistentUser)
        .inject(response().html('<script>window.close();</script>').build());
});

// GET /login/verify
route('verify', async function (req: NextRequest) {
    const reader = await SessionReader.fromRequest(req);

    if (!reader.isValid) {
        return await new SessionWriter()
            .deleteSession()
            .inject(response().redirect('/login').build());
    }

    const exists = await UsersRepository.selectQb()
        .select(sql<number>`COUNT(*)`.as('count'))
        .where('id', '=', reader.userId)
        .executeTakeFirst();

    if (!exists || exists.count < 1) {
        return await new SessionWriter()
            .deleteSession()
            .inject(response().redirect('/login').build());
    }

    const next = new URL(req.url).searchParams.get('next');
    const resp = response()
        .redirect(next ? decodeURIComponent(next) : '/')
        .build();

    return await new SessionWriter().setData(reader.session).inject(resp);
});

// /logout
export async function handleLogout(): Promise<NextResponse> {
    return response().deleteSession().redirectPost('/login').build();
}
