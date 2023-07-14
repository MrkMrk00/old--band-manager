import { Navbar } from '@/view/components';
import { useSession } from '@/lib/hooks';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user = await useSession();

    if (!user) {
        redirect('/login');
        return;
    }

    return (
        <body>
            <Navbar user={user} />
            {children}
            <Toaster />
        </body>
    );
}
