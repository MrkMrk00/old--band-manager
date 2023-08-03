import { ReactNode } from 'react';

export const metadata = {
    title: 'Nastavení aplikace',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
