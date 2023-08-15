import { UsersRepository } from '@/lib/repositories';
import { sql } from 'kysely';
import { SessionReader, SessionWriter } from '@/lib/auth/session';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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
