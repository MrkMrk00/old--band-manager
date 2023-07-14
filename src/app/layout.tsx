import '@/assets/globals.css';
import { Roboto_Flex } from 'next/font/google';
import { TRPCProvider } from '@/lib/trcp/trpc-provider';

const font = Roboto_Flex({ subsets: ['latin-ext'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="cs">
            <TRPCProvider>
                <body className={font.className}>{children}</body>
            </TRPCProvider>
        </html>
    );
}
