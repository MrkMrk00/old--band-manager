import { useUser } from '@/lib/hooks';
import { Button, Input } from '@/view/layout';
import type { ReactNode } from 'react';
import Image from 'next/image';
import fbLogo from '@/assets/fb_logo_250.png';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

export const metadata = {
    title: 'Můj profil',
};

function SectionRow(props: { children?: ReactNode; className?: string }) {
    return (
        <div className={twMerge('flex flex-row gap-3 items-center px-5', props.className)}>
            {props.children}
        </div>
    );
}

export default async function Me() {
    const user = await useUser();

    if (!user) {
        redirect('/login');
        return;
    }

    return (
        <main className="flex flex-col justify-center items-center mt-4">
            <form className="flex flex-col gap-4 max-w-3xl w-11/12 rounded-xl border shadow">
                <h3 className="font-bold text-xl border-b px-4 p-2 rounded-t-xl bg-gray-50">
                    O mně
                </h3>
                <SectionRow>
                    <label className="w-32" htmlFor="displayName">
                        Přezdívka
                    </label>
                    <Input id="displayName" defaultValue={user.display_name} />
                </SectionRow>
                <hr />

                <SectionRow>
                    <span className="w-32">Zdroj přihlášení</span>
                    {user.fb_id !== null && (
                        <div title={`Id: ${user.fb_id}`} className="flex flex-row gap-2">
                            <Image src={fbLogo} alt="Facebook logo" height={24} /> Facebook
                        </div>
                    )}

                    {user.email !== null && (
                        <div className="flex flex-row gap-2 items-center">
                            <strong className="text-[24px]">@</strong>
                            <span>E-mail</span>
                        </div>
                    )}
                </SectionRow>
                <hr />

                <SectionRow className="justify-end">
                    <Button className="bg-green-400" type="button">
                        Uložit
                    </Button>
                </SectionRow>

                <span />
            </form>
        </main>
    );
}
