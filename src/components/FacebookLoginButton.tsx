'use client';

import { ReactNode } from 'react';
import env from '@/env.mjs';
import Image from 'next/image';
import fbLogo from '@/assets/fb_logo_250.png';
import { useRouter } from 'next/navigation';

const authDialogUrl = (appKey: string, returnUrl: string) =>
    `https://www.facebook.com/v16.0/dialog/oauth?client_id=${appKey}&redirect_uri=${returnUrl}`;

function openFacebookDialog(onClose: (ev: Event) => void) {
    const appKey = env.NEXT_PUBLIC_FB_APP_ID;
    const redirectUrl = `${location.protocol}//${location.host}/login/fb-success`;
    const url = authDialogUrl(appKey, redirectUrl);

    const newWindow = window.open(
        url,
        '_blank',
        'fullscreen=no,menubar=no,status=no,width=600,height=800',
    );
    if (newWindow) {
        newWindow.addEventListener('beforeunload', onClose);
    }
}

type Props = {
    children?: ReactNode;
};

export default function FacebookLoginButton(props: Props) {
    const router = useRouter();

    function handleRedirect() {
        const url = new URL(location.href);
        const nextRoute = url.searchParams.get('next');
        router.push(nextRoute ?? '/dashboard');
    }

    return (
        <button
            className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:shadow-[#1774f2] transition-all ease-in-out duration-300 px-5 py-3"
            onClick={() => openFacebookDialog(handleRedirect)}
        >
            <div className="flex gap-2">
                <Image src={fbLogo} alt="Facebook logo" height={36} />
                <span className="inline-flex items-center">Přihlásit se přes Facebook</span>
            </div>
            {props.children}
        </button>
    );
}
