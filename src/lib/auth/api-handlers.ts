import { NextRequest, NextResponse } from 'next/server';
import { FacebookAuth, handleFacebookAuth } from '@/lib/auth/handler/facebook';
import { SessionReader, SessionWriter } from '@/lib/auth/session';
import { UsersRepository } from '@/lib/repositories';
import { sql } from 'kysely';

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

export default function authApiHandler(
    request: NextRequest,
    { params }: { params: Record<string, string> },
): Promise<NextResponse> {
    const { handler } = params;

    const handlerFunc = routes.get(handler);

    if (!handlerFunc) {
        return Promise.resolve(
            new NextResponse(null, {
                status: 404,
            }),
        );
    }

    return handlerFunc(request);
}

route('fb-success', async function (req: NextRequest) {
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
});

route('verify', async function (req: NextRequest) {
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
});

// /logout
export async function handleLogout(req: NextRequest): Promise<NextResponse> {
    return await new SessionWriter()
        .deleteSession()
        .inject(NextResponse.redirect(new URL('/login', req.url)));
}

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
