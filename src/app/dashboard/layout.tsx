import './globals.css';
import { Roboto_Flex } from 'next/font/google';

const font = Roboto_Flex({ subsets: ['latin-ext']});

export const metadata = {
    title: 'Band Manager',
    description: '',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="cs">
            <body className={font.className}>{children}</body>
        </html>
    );
}
