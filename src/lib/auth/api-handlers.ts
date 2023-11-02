import DatabaseAuthHandler, { ensureAdminUser } from '@/lib/auth/handler/email';
import { FacebookAuth, handleRegisterFacebookUser } from '@/lib/auth/handler/facebook';
import { JWTSession, getSession } from '@/lib/auth/session';
import response from '@/lib/http/response';
import getRepositoryFor from '@/lib/repositories';
import type { NextRequest, NextResponse } from 'next/server';

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

    const usersRepository = getRepositoryFor('users');
    const user = await new DatabaseAuthHandler(usersRepository).accept(req);

    if ('error' in user) {
        const url = new URL('/login', req.url);
        url.searchParams.append('err_str', user.message);

        return response().redirectPost(url).build();
    }

    const session = new JWTSession();
    session.userId = user.id;
    session.displayName = user.display_name;
    const cookie = await session.cookie();

    if ('error' in cookie) {
        return response().redirect('/login').errStr(cookie.message).build();
    }

    return response().redirect('/').pushCookie(cookie).build();
});

route('fb-success', async function (req: NextRequest) {
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
});

function removeSession(): NextResponse {
    return response().deleteSession().redirect('/login').build();
}

/**
 * Renew session cookie and verify, that the logged in user still exists.
 * Requests to any route/page under the (dashboard)/layout.tsx get redirected
 * here every (15) minutes.
 */
route('verify', async function (req: NextRequest): Promise<NextResponse> {
    const session = await getSession();

    // no session cookie | invalid signature | invalid session state
    if ('error' in session || typeof session.userId === 'undefined') {
        return removeSession();
    }

    const users = getRepositoryFor('users');
    const exists = await users.findById(session.userId).execute();

    // user with the ID specified in session does not exist
    if (exists.length !== 1) {
        return removeSession();
    }

    const cookie = await session.cookie();
    if ('error' in cookie) {
        return response().serverError().build();
    }

    const redirectTo = req.nextUrl.searchParams.get('next') || '/';
    return response().pushCookie(cookie).redirect(redirectTo).build();
});

// /logout
export async function handleLogout(): Promise<NextResponse> {
    return response().deleteSession().redirectPost('/login').build();
}
