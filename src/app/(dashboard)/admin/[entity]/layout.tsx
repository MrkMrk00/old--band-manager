import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nastavení aplikace',
};

function EntityListAndDetailLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export default EntityListAndDetailLayout;
