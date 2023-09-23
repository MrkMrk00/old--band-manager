import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Nastavení aplikace',
};

function EntityListAndDetailLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export default EntityListAndDetailLayout;
