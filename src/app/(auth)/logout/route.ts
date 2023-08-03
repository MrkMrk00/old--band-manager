import { COOKIE_SETTINGS } from '@/lib/auth/session';

async function handler() {
    return new Response(null, {
        status: 301,
        headers: {
            'Set-Cookie': `${COOKIE_SETTINGS.name}=null; Max-Age=0`,
            Location: '/',
        },
    });
}

export { handler as GET, handler as POST };
