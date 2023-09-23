import { LoginForms } from './client';
import { redirect } from 'next/navigation';
import env from '@/env.mjs';
import { getSession } from '@/lib/auth/session';

export const metadata = {
    title: 'Přihlášení',
    description: 'Stránka s přihlášením',
};

export default async function LoginPage() {
    const session = await getSession();

    if (!('error' in session) && typeof session.userId !== 'undefined') {
        redirect('/');
    }

    return <LoginForms fbLoginEnabled={!!env.FB_APP_SECRET} />;
}
