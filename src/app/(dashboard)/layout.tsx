import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/lib/auth/session';
import Navigation from '@/view/components/nav/DashboardNavigation';

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    if ('error' in session) {
        redirect('/login');
    }

    const fifteenMinutesAgo = Date.now() / 1000 - 15 * 60;
    if (session.issuedAt && session.issuedAt < fifteenMinutesAgo) {
        redirect('/login/verify');
    }

    return (
        <>
            <Navigation />
            {children}
        </>
    );
}
