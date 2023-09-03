import type { NextRequest, NextResponse } from 'next/server';
import { FacebookAuth, handleFacebookAuth } from '@/lib/auth/handler/facebook';
import { SessionReader, SessionWriter } from '@/lib/auth/session';
import { UsersRepository } from '@/lib/repositories';
import { sql } from 'kysely';
import DatabaseAuthHandler, { ensureAdminUser } from '@/lib/auth/handler/email';
import response from '@/lib/http/response';

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
        return Promise.resolve(response().notFound().get());
    }

    return await handlerFunc(request);
}

route('form', async function (req) {
    void (await ensureAdminUser());

    const user = await new DatabaseAuthHandler().accept(req);
    if (!user) {
        return response().badRequest().get();
    }

    return await new SessionWriter()
        .setData(user.toPersistentUser())
        .inject(r => r.redirectPost('/'));
});

route('fb-success', async function (req: NextRequest) {
    const url = new URL(req.url);

    const loginResolver = new FacebookAuth(url.href.replace(url.search, ''));
    const facebookUser = await loginResolver.accept(req);

    if ('error' in facebookUser) {
        return response()
            .html(`<pre>Nepodařilo se přihlásit.<br />${facebookUser.error?.message}</pre>`)
            .get();
    }

    const persistentUser = await handleFacebookAuth(facebookUser);

    if (persistentUser instanceof Error) {
        return response()
            .html(
                `<pre>Registration failed: ${JSON.stringify(
                    persistentUser.message,
                    null,
                    4,
                )}</pre>`,
            )
            .get();
    }

    // happy path -> frontend listens to close event
    return await new SessionWriter()
        .setData(persistentUser)
        .inject(response().html('<script>window.close();</script>').get());
});

// GET /login/verify
route('verify', async function (req: NextRequest) {
    const reader = await SessionReader.fromRequest(req);

    if (!reader.isValid) {
        return await new SessionWriter()
            .deleteSession()
            .inject(response().redirect('/login').get());
    }

    const exists = await UsersRepository.selectQb()
        .select(sql<number>`COUNT(*)`.as('count'))
        .where('id', '=', reader.userId)
        .executeTakeFirst();

    if (!exists || exists.count < 1) {
        return await new SessionWriter()
            .deleteSession()
            .inject(response().redirect('/login').get());
    }

    const next = new URL(req.url).searchParams.get('next');
    const resp = response()
        .redirect(next ? decodeURIComponent(next) : '/')
        .get();

    return await new SessionWriter().setData(reader.session).inject(resp);
});

// /logout
export async function handleLogout(): Promise<NextResponse> {
    return await new SessionWriter()
        .deleteSession()
        .inject(response().redirectPost('/login').get());
}
