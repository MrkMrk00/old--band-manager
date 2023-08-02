import { Navbar } from '@/view/components';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { getSession } from '@/lib/auth/session';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user = await getSession();

    if (!user) {
        redirect('/login');
        return;
    }

    // Issued more than 15 minutes ago
    // Check if user still exits
    if ((user.iat ?? 0) < ((Date.now() / 1000) - (15 * 60))) {
        redirect('/login/verify');
    }

    return (
        <>
            <Navbar user={user} />
            {children}
            <Toaster />
        </>
    );
}
