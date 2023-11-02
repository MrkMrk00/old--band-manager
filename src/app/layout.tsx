import '@/assets/globals.css';
import { TRPCProvider } from '@/lib/trcp/provider';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const font = Inter({ subsets: ['latin-ext'] });

export const metadata: Metadata = {
    manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="cs" className="bm-mobile-bottom-always-show">
            <body className={`${font.className} flex flex-col font-xl`}>
                <TRPCProvider>{children}</TRPCProvider>
                <Toaster position="bottom-center" />
            </body>
        </html>
    );
}
