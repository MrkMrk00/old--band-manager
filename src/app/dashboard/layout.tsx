import { Roboto_Flex } from 'next/font/google';
import Link from 'next/link';

const font = Roboto_Flex({ subsets: ['latin-ext'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <body className={font.className}>
            <nav className="flex flex-row h-12 px-2 gap-1 text-center items-center">
                <Link className="underline p-1" href="/dashboard/">Domů</Link>
                <Link className="underline p-1" href="/dashboard/me">Profil</Link>
            </nav>
            {children}
        </body>
    );
}
