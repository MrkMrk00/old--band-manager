import { SessionWriter } from '@/lib/auth/session';
import { type NextRequest, NextResponse } from 'next/server';

async function handler(request: NextRequest) {
    return await new SessionWriter()
        .deleteSession()
        .inject(NextResponse.redirect(new URL('/login', request.url)));
}

export { handler as GET, handler as POST };
