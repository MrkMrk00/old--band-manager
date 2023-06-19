import '@/assets/globals.css';
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="cs">
            <Script defer src="/fa-licence.js" />
            {children}
        </html>
    );
}
