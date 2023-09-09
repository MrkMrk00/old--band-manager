'use client';

import env from '@/env.mjs';
import Image from 'next/image';
import fbLogo from '@/assets/fb_logo_250.png';
import { useRouter } from 'next/navigation';
import { Button } from '@/view/layout';
import { ButtonHTMLAttributes } from 'react';
import { isMobile } from '@/view/client.helpers';

const authDialogUrl = (appKey: string, returnUrl: string, state?: string) =>
    `https://www.facebook.com/v17.0/dialog/oauth?client_id=${appKey}&redirect_uri=${returnUrl}${
        state ? '&state=' + state : ''
    }`;

function handleClick(onClose: (ev: Event) => void) {
    const appKey = env.NEXT_PUBLIC_FB_APP_ID!;
    const redirectUrl = `${location.protocol}//${location.host}/login/fb-success`;
    const mobile = isMobile();

    const url = authDialogUrl(appKey, redirectUrl, mobile ? 'redirect' : undefined);

    if (isMobile()) {
        location.replace(url);
        return;
    }

    const newWindow = window.open(
        url,
        '_blank',
        'fullscreen=no,menubar=no,status=no,width=600,height=800',
    );
    if (newWindow) {
        newWindow.addEventListener('beforeunload', onClose);
    }
}

export default function FacebookLoginButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const router = useRouter();

    function handleRedirect() {
        const url = new URL(location.href);
        const nextRoute = url.searchParams.get('next');
        router.push(nextRoute ?? '/');
    }

    return (
        <Button {...props} onClick={() => handleClick(handleRedirect)}>
            <Image src={fbLogo} alt="Facebook logo" height={36} width={36} />
            <span className="inline-flex items-center">Přihlásit se přes Facebook</span>
        </Button>
    );
}
