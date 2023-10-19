import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/lib/auth/session';
import Navigation from '@/view/components/nav/DashboardNavigation';
import { wrapUser } from '@/model/user';
import ContextWrapper from './context-wrapper';

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    if ('error' in session) {
        redirect('/login');
    }

    const fifteenMinutesAgo = Date.now() / 1000 - 15 * 60;
    if (session.issuedAt && session.issuedAt < fifteenMinutesAgo) {
        redirect('/login/verify');
    }

    const user = await wrapUser(session.persistentUser).fetchFull();

    return (
        <ContextWrapper user={user!}>
            <Navigation />
            {children}
        </ContextWrapper>
    );
}
