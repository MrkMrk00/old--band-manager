import env from '@/env.mjs';

import { ModalMounter } from './client';
import bigBandLogo from '@/assets/bigbandlogo.png';
import fbLogo from '@/assets/fb_logo_250.png';
import { getSession } from '@/lib/auth/session';
import { Button, Input, Link, OverlayText } from '@/view/layout';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Přihlášení',
    description: 'Stránka s přihlášením',
};

function FacebookLoginButton() {
    const authDialogUrl = `https://www.facebook.com/v${env.FB_VAPI}/dialog/oauth?client_id=${
        env.FB_APP_ID
    }&redirect_uri=${env.NEXT_PUBLIC_DOMAIN + 'login/fb-success'}`;

    return (
        <Link className="py-4 border-2 w-full text-center group" href={authDialogUrl}>
            <OverlayText>
                <Image src={fbLogo} alt="Facebook logo" height={36} width={36} />
            </OverlayText>
            Přihlásit se přes{' '}
            <strong className="group-hover:text-blue-600 text-blue-600 md:text-inherit transition-colors">
                Facebook
            </strong>
        </Link>
    );
}

export default async function LoginPage() {
    const session = await getSession();

    if (!('error' in session) && typeof session.userId !== 'undefined') {
        redirect('/');
    }

    const facebookLoginEnabled = !!env.FB_APP_SECRET && !!env.FB_APP_ID;

    return (
        <div className="flex flex-row flex-wrap md:flex-nowrap w-full h-full max-h-screen">
            <aside className="flex flex-col p-8 gap-4 w-full md:max-w-md min-w-md">
                {facebookLoginEnabled && <FacebookLoginButton />}

                <ModalMounter>
                    <form method="post" action="/login/form">
                        <div className="flex flex-col gap-6 p-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="emailBtn">E-mail</label>
                                <Input
                                    id="emailBtn"
                                    name="email"
                                    type="email"
                                    placeholder="jan@novak.cz"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="passwordBtn">Heslo</label>
                                <Input
                                    id="passwordBtn"
                                    name="password"
                                    type="password"
                                    placeholder="******"
                                />
                            </div>

                            <Button type="submit" className="bg-green-400">
                                Přihlásit se
                            </Button>
                        </div>
                    </form>
                </ModalMounter>
            </aside>

            <main className="flex flex-row justify-center w-full">
                <Image
                    src={bigBandLogo}
                    alt="Big Band Vrchlabí"
                    className="object-contain w-auto max-h-[66%]"
                />
            </main>
        </div>
    );
}
