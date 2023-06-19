import { Roboto_Flex } from 'next/font/google';
import { Navbar } from '@/view/components';
import { useSession } from '@/lib/hooks';

const font = Roboto_Flex({ subsets: ['latin-ext'] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user = await useSession();

    return (
        <>
            <body className={font.className}>
                <Navbar user={user} />
                {children}
            </body>
        </>
    );
}
