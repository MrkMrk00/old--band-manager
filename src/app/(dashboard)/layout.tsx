import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { COOKIE_SETTINGS, SessionReader } from '@/lib/auth/session';
import { useUser } from '@/lib/hooks';
import Navigation from '@/view/components/nav/DashboardNavigation';

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
            <Navigation user={user} />
            {children}
        </>
    );
}
