import type { ReactNode } from 'react';
import { getAccessToken, getUserInfo } from '@/lib/facebook';
import { CloseButton } from './client';
import env from '@/env.mjs';

type PageProps = {
    searchParams: {
        code?: string,
    },
};

const REDIRECT_URL = `${env.DOMAIN}login/fb-success`;

function CenterLayout({ children }: { children?: ReactNode }) {
    return (
        <main className="flex flex-col justify-center items-center h-full gap-2">
            { children }
        </main>
    );
}

export default async function LoginSuccessPage({ searchParams }: PageProps) {
    const { code } = searchParams;

    if (!code) {
        return (
            <CenterLayout>
                <p className="text-red-500 font-bold">Nepodařilo se přihlásit přes Facebook :(</p>
            </CenterLayout>
        );
    }

    const token = await getAccessToken(code, REDIRECT_URL);

    return (
        <CenterLayout>
            <p>Přihlášení se vydařilo :)</p>
            <CloseButton />
        </CenterLayout>
    );
}