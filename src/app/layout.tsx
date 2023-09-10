import '@/assets/globals.css';
import { Inter } from 'next/font/google';
import { TRPCProvider } from '@/lib/trcp/provider';
import { Toaster } from 'react-hot-toast';
import { Metadata } from 'next';

const font = Inter({ subsets: ['latin-ext'] });

export const metadata: Metadata = {
    manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="cs">
            <body className={`${font.className} flex flex-col`}>
                <TRPCProvider>{children}</TRPCProvider>
                <Toaster position="bottom-center" />
            </body>
        </html>
    );
}
