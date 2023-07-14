import { COOKIE_SETTINGS } from '@/lib/auth/session';

export async function POST() {
    return new Response(null, {
        status: 301,
        headers: {
            'Set-Cookie': `${COOKIE_SETTINGS.name}=null; Max-Age=0`,
            Location: '/',
        },
    });
}
