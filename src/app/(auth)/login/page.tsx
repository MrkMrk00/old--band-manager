import { LoginForms } from './client';
import env from '@/env.mjs';
import { redirect } from 'next/navigation';
import { getSessionRSC } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'Přihlášení',
    description: 'Stránka s přihlášením',
};

export default async function LoginPage() {
    const session = await getSessionRSC(cookies());

    if (!('error' in session) && typeof session.userId !== 'undefined') {
        redirect('/');
    }

    return <LoginForms fbLoginEnabled={!!env.FB_APP_SECRET} />;
}
