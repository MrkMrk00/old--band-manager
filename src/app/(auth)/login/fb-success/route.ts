import type { NextRequest } from 'next/server';
import { FacebookAuth, handleFacebookAuth } from '@/lib/auth/handler/facebook';
import { SessionWriter } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

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

export async function GET(req: NextRequest) {
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
