'use client';

import { FacebookLoginButton } from '@/view/components';
import Image from 'next/image';
import bigBandLogo from '@/assets/bigbandlogo.png';
import { FormHTMLAttributes, useState } from 'react';
import { Button, Input } from '@/view/layout';

function EmailLoginForm(props: FormHTMLAttributes<HTMLFormElement>) {
    return (
        <form {...props}>
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="emailBtn">E-mail</label>
                    <Input id="emailBtn" name="email" type="email" placeholder="jan@novak.cz" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="passwordBtn">Heslo</label>
                    <Input id="passwordBtn" name="password" type="password" placeholder="******" />
                </div>

                <Button type="submit" className="bg-green-400">
                    Přihlásit se
                </Button>
            </div>
        </form>
    );
}

export function LoginForms() {
    const [formDisplayed, setFormDisplayed] = useState(false);

    return (
        <div className="flex md:flex-row flex-col w-full h-full">
            <div className="md:w-1/3 flex flex-col pt-16 px-16 md:pr-0 gap-6 h-full">
                <h3 className="text-2xl font-bold">Přihlásit se</h3>
                <div className="flex flex-col gap-2 2xl:w-1/2 w-full">
                    <FacebookLoginButton className="border flex flex-row gap-2" />
                    <Button
                        className={`border flex flex-row gap-2 items-center${
                            formDisplayed ? ' bg-green-200' : ''
                        }`}
                        onClick={() => setFormDisplayed(!formDisplayed)}
                    >
                        <span className="font-bold px-2 text-2xl">@</span>
                        <span>Přihlásit se e-mailem</span>
                    </Button>
                </div>
            </div>

            <main className="w-full md:w-2/3 flex flex-row justify-center items-center h-full">
                {formDisplayed ? (
                    <EmailLoginForm
                        className="flex flex-col md:justify-center md:w-2/3 xl:w-1/3 w-full px-16 md:px-4 h-full"
                        method="POST"
                        action="/login"
                    />
                ) : (
                    <Image
                        src={bigBandLogo}
                        alt="Big Band Vrchlabí"
                        className="h-2/3 object-contain w-auto"
                    />
                )}
            </main>
        </div>
    );
}