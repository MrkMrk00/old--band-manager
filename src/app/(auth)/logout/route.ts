import { COOKIE_SETTINGS } from '@/lib/auth/jwt';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const { name } = COOKIE_SETTINGS;

    let data: FormData | undefined = undefined;
    try {
        data = await request.formData();
    } catch (ignore: unknown) {}

    let redirectTo = data && data.has('next') ? data.get('next') : null;

    if (typeof redirectTo !== 'string') {
        redirectTo = '/';
    }

    return new Response(null, {
        status: 301,
        headers: {
            'Set-Cookie': `${name}=null; Max-Age=0`,
            Location: redirectTo,
        },
    });
}
