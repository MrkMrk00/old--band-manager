'use client';

import { type ComponentPropsWithRef, type ReactNode, useEffect, useState } from 'react';
import { Link } from '@/view/layout';
import { twMerge } from 'tailwind-merge';

function TableListChooser(props: ComponentPropsWithRef<typeof Link> & { active?: boolean }) {
    const { className, children, active, ...other } = props;

    return (
        <Link
            {...other}
            className={twMerge(
                `rounded-md shadow-none border text-center inline-flex flex-row justify-center items-center${
                    active ? ' bg-green-300' : ''
                }`,
                className,
            )}
        >
            {children}
        </Link>
    );
}

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
    const [active, setActive] = useState<string>('');

    useEffect(() => {
        setActive(matchPathname(location.pathname));
    }, [children]);

    return (
        <div className="flex md:flex-row flex-col h-full w-full">
            <aside className="md:max-w-xs w-full flex flex-col gap-2 bg-slate-100 p-4 shadow">
                <span className="mx-auto">Sekce nastavení</span>

                <TableListChooser
                    href="/admin"
                    onClick={() => void setActive(matchPathname(location.pathname))}
                    active={active === 'home'}
                >
                    Domovská stránka
                </TableListChooser>

                <TableListChooser
                    href="/admin/instruments"
                    onClick={() => void setActive(matchPathname(location.pathname))}
                    active={active === 'instruments'}
                >
                    Nástoje
                </TableListChooser>

                <TableListChooser
                    href="/admin/users"
                    onClick={() => void setActive(matchPathname(location.pathname))}
                    active={active === 'users'}
                >
                    Uživatelé
                </TableListChooser>
            </aside>
            <main className="flex flex-row justify-center p-4 w-full">{children}</main>
        </div>
    );
}
