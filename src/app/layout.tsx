import '@/assets/globals.css';
import { Inter } from 'next/font/google';
import { TRPCProvider } from '@/lib/trcp/provider';

const font = Inter({ subsets: ['latin-ext'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="cs">
            <body className={`${font.className} flex flex-col`}>
                <TRPCProvider>{children}</TRPCProvider>
            </body>
        </html>
    );
}
