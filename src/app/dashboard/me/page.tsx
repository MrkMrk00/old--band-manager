import { useUser$ } from '@/entity/user';
import { Button, Input } from '@/lib/layout';
import type { ReactNode } from 'react';
import Image from 'next/image';
import fbLogo from '@/assets/fb_logo_250.png';

export const metadata = {
    title: 'Můj profil',
};

function SectionRow(props: { children?: ReactNode; className?: string }) {
    return (
        <div className={`flex flex-row gap-3 items-center px-5 ${props.className}`}>
            { props.children }
        </div>
    );
}

export default async function Me() {
    const user = await useUser$();

    return (
        <main className="flex flex-col justify-center items-center">
            <form className="flex flex-col gap-4 max-w-3xl w-full rounded-xl border shadow">
                <h3 className="font-bold text-xl border-b p-2 rounded-t-xl bg-gray-50">O mně</h3>
                <SectionRow>
                    <label className="w-32" htmlFor="displayName">Přezdívka</label>
                    <Input colorStyle="yellow-400" id="displayName" value={user?.display_name} />
                </SectionRow>
                <hr />

                <SectionRow>
                    <span className="w-32">Zdroj přihlášení</span>
                    <div title={`Id: ${user?.id}`} className="flex flex-row gap-2"><Image src={fbLogo} alt="Facebook logo" height={24} /> Facebook</div>
                </SectionRow>
                <hr />

                <SectionRow className="justify-end">
                    <Button type="button" colorStyle="success">Uložit</Button>
                </SectionRow>

                <span />
            </form>
        </main>
    );
}
