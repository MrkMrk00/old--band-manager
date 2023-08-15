'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Link } from '@/view/layout';
import { twMerge } from 'tailwind-merge';
import { FaMusic, FaUser } from 'react-icons/fa6';
import { FaHome } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

// export const metadata = {
//     title: 'Nastavení aplikace',
// };

function SettingsButton(props: ComponentPropsWithRef<typeof Link> & { active?: boolean }) {
    const { className, children, active, ...other } = props;

    return (
        <Link
            {...other}
            className={twMerge(
                `px-10 rounded-md shadow-none border text-center inline-flex flex-row justify-center items-center${
                    active ? ' bg-green-300' : ''
                }`,
                className,
            )}
        >
            {children}
        </Link>
    );
}

SettingsButton.Icon = function ({ children, active }: { children?: ReactNode; active?: boolean }) {
    return (
        <span
            className={`absolute w-full h-full inline-flex justify-start items-center px-4${
                !active ? ' hover:text-green-300 transition-colors' : ''
            }`}
        >
            {children}
        </span>
    );
};

SettingsButton.Title = function ({ children }: { children?: ReactNode }) {
    return <span className="w-full inline-flex justify-center items-center">{children}</span>;
};

function matchPathname(hrefPathname: string | undefined) {
    if (hrefPathname?.startsWith('/admin/instruments')) {
        return 'instruments';
    }

    if (hrefPathname?.startsWith('/admin/users')) {
        return 'users';
    }

    if (hrefPathname && hrefPathname === '/admin') {
        return 'home';
    }

    return '';
}

export default function MenuTemplate({ children }: { children?: ReactNode }) {
    const active = matchPathname(usePathname());

    return (
        <div className="flex md:flex-row flex-col h-full w-full">
            <aside className="md:max-w-sm min-w-fit w-full flex flex-col gap-2 bg-slate-100 p-4 shadow">
                <span className="mx-auto">Sekce nastavení</span>

                <SettingsButton href="/admin" active={active === 'home'}>
                    <SettingsButton.Icon active={active === 'home'}>
                        <FaHome />
                    </SettingsButton.Icon>
                    <SettingsButton.Title>Domovská stránka</SettingsButton.Title>
                </SettingsButton>

                <SettingsButton href="/admin/instruments" active={active === 'instruments'}>
                    <SettingsButton.Icon active={active === 'instruments'}>
                        <FaMusic />
                    </SettingsButton.Icon>
                    <SettingsButton.Title>Nástroje</SettingsButton.Title>
                </SettingsButton>

                <SettingsButton href="/admin/users" active={active === 'users'}>
                    <SettingsButton.Icon active={active === 'users'}>
                        <FaUser />
                    </SettingsButton.Icon>
                    <SettingsButton.Title>Uživatelé</SettingsButton.Title>
                </SettingsButton>
            </aside>
            <main className="flex flex-row justify-center p-4 w-full">{children}</main>
        </div>
    );
}
