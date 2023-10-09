'use client';

import { usePathname } from 'next/navigation';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { FaMusic, FaPeopleGroup, FaUser } from 'react-icons/fa6';
import { GiTrumpet } from 'react-icons/gi';
import { twMerge } from 'tailwind-merge';
import { isMobile } from '@/view/client.helpers';
import { Link, OverlayText } from '@/view/layout';

type ButtonProps = ComponentPropsWithRef<typeof Link> & {
    active?: boolean;
};

function SettingsButton(props: ButtonProps) {
    const { className, children, active, ...other } = props;

    return (
        <Link
            {...other}
            className={twMerge(
                'px-10 rounded-md shadow-none border text-center inline-flex flex-row justify-center items-center',
                active ? 'bg-green-300' : '',
                className,
            )}
        >
            {children}
        </Link>
    );
}

SettingsButton.Icon = OverlayText;

SettingsButton.Title = function ({ children }: { children?: ReactNode }) {
    return <span className="w-full inline-flex justify-center items-center">{children}</span>;
};

function useShouldDisplayMenu() {
    const pathname = usePathname();
    const isDetail = pathname.split('/').length >= 4;

    const [should, setShould] = useState(true);

    useEffect(() => {
        const listener = function () {
            setShould(!isMobile() || !isDetail);
        };

        listener();

        window.addEventListener('resize', listener);

        return () => window.removeEventListener('resize', listener);
    }, [isDetail]);

    return should;
}

export default function MenuTemplate({ children }: { children?: ReactNode }) {
    const pathname = usePathname();
    const shouldDisplayMenu = useShouldDisplayMenu();

    return (
        <div className="flex md:flex-row flex-col h-full w-full">
            {shouldDisplayMenu && (
                <aside className="md:max-w-sm min-w-fit w-full flex flex-col gap-2 bg-slate-100 p-4 shadow">
                    <span className="mx-auto">Sekce nastavení</span>
                    <hr />

                    <SettingsButton href="/admin" active={pathname === '/admin'}>
                        <SettingsButton.Icon>
                            <FaHome />
                        </SettingsButton.Icon>
                        <SettingsButton.Title>Domovská stránka</SettingsButton.Title>
                    </SettingsButton>

                    <hr />

                    <SettingsButton
                        href="/admin/instruments"
                        active={pathname.startsWith('/admin/instruments')}
                    >
                        <SettingsButton.Icon>
                            <GiTrumpet />
                        </SettingsButton.Icon>
                        <SettingsButton.Title>Nástroje</SettingsButton.Title>
                    </SettingsButton>

                    <SettingsButton
                        href="/admin/instrument-groupings"
                        active={pathname.startsWith('/admin/instrument-groupings')}
                    >
                        <SettingsButton.Icon>
                            <FaPeopleGroup />
                        </SettingsButton.Icon>
                        <SettingsButton.Title>Sekce</SettingsButton.Title>
                    </SettingsButton>

                    <hr />

                    <SettingsButton
                        href="/admin/songs"
                        active={pathname.startsWith('/admin/songs')}
                    >
                        <SettingsButton.Icon>
                            <FaMusic />
                        </SettingsButton.Icon>
                        <SettingsButton.Title>Skladby</SettingsButton.Title>
                    </SettingsButton>

                    <hr />

                    <SettingsButton
                        href="/admin/users"
                        active={pathname.startsWith('/admin/users')}
                    >
                        <SettingsButton.Icon>
                            <FaUser />
                        </SettingsButton.Icon>
                        <SettingsButton.Title>Uživatelé</SettingsButton.Title>
                    </SettingsButton>
                </aside>
            )}
            <main className="flex flex-row justify-center p-4 w-full">{children}</main>
        </div>
    );
}
