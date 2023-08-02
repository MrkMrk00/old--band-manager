import { UsersRepository } from '@/lib/repositories';
import { sql } from 'kysely';
import { COOKIE_SETTINGS, createSessionCookie, getSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const user = await getSession(req);

    if (!user) {
        const resp = NextResponse.redirect(new URL('/login', req.url));
        resp.cookies.delete(COOKIE_SETTINGS.name);

        return resp;
    }

    const exists = await UsersRepository.selectQb()
        .select(sql<number>`COUNT(*)`.as('count'))
        .where('id', '=', user.id)
        .executeTakeFirst();

    if (!exists || exists.count < 1) {
        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete(COOKIE_SETTINGS.name);

        return response;
    }

    // @ts-ignore
    cookies().set(await createSessionCookie(user as Record<string, number|string>));

    return NextResponse.redirect(req.headers.get('referer') ?? new URL('/', req.url));
}