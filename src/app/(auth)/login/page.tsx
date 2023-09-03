import { LoginForms } from './client';
import env from '@/env.mjs';
import { redirect } from 'next/navigation';
import { useSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'Přihlášení',
    description: 'Stránka s přihlášením',
};

export default async function LoginPage() {
    const user = await useSession(cookies());
    if (user) {
        redirect('/');
    }

    const fbLoginEnabled = !!env.FB_APP_SECRET;

    return <LoginForms fbLoginEnabled={fbLoginEnabled} />;
}
