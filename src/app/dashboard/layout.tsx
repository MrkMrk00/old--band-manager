import { Roboto_Flex } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { useUser$ } from '@/lib/hooks';

const font = Roboto_Flex({ subsets: ['latin-ext'] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user = await useUser$(false);

    return (
        <body className={font.className}>
            <Navbar user={user} />
            {children}
        </body>
    );
}
