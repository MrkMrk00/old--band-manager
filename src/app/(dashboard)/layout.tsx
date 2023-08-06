import { Navbar } from '@/view/components';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { COOKIE_SETTINGS, SessionReader } from '@/lib/auth/session';
import { RedirectType } from 'next/dist/client/components/redirect';
import { cookies } from 'next/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const reader = await SessionReader.fromToken(cookies().get(COOKIE_SETTINGS.name)?.value);

    if (!reader.isValid) {
        redirect('/login');
    }

    const user = reader.payload;

    // Issued more than 15 minutes ago
    // Check if user still exits
    if ((user.iat ?? 0) < Date.now() / 1000 - 15 * 60) {
        redirect('/login/verify', RedirectType.replace);
    }

    return (
        <>
            <Navbar user={user} />
            {children}
            <Toaster />
        </>
    );
}
