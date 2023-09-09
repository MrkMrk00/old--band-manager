import type { ReactNode } from 'react';
import Navbar from '@/view/components/DashboardNavbar';
import { COOKIE_SETTINGS, SessionReader } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { useUser } from '@/lib/hooks';

export default async function RootLayout({ children }: { children: ReactNode }) {
    const reader = await SessionReader.fromToken(cookies().get(COOKIE_SETTINGS.name)?.value);

    if (!reader.isValid) {
        redirect('/login');
    }

    const fifteenMinutesAgo = Date.now() / 1000 - 15 * 60;
    if (reader.payload.iat && reader.payload.iat < fifteenMinutesAgo) {
        redirect('/login/verify');
    }

    const user = await useUser();

    return (
        <>
            <Navbar user={user} />
            {children}
        </>
    );
}
