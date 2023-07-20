'use client';

import { type ComponentPropsWithRef, type MouseEvent, useEffect, useState } from 'react';
import { Link } from '@/view/layout';
import { twMerge } from 'tailwind-merge';

function TableListChooser(props: ComponentPropsWithRef<typeof Link> & { active?: boolean }) {
    const { className, children, active, ...other } = props;

    return (
        <Link
            {...other}
            className={twMerge(
                `rounded-md shadow-none border text-center${active ? ' bg-green-300' : ''}`,
                className,
            )}
        >
            {children}
        </Link>
    );
}

function matchPathname(hrefPathname: string | undefined) {
    switch (hrefPathname) {
        case '/admin/instruments':
            return 'instruments';
    }

    return '';
}

export function AdminNavigation() {
    const [active, setActive] = useState<string>('');

    useEffect(() => {
        setActive(matchPathname(location.pathname));
    }, []);

    function handleClick(ev: MouseEvent<HTMLAnchorElement>) {
        const hrefPathname = ev.currentTarget.attributes.getNamedItem('href')?.value;

        setActive(matchPathname(hrefPathname));
    }

    return (
        <aside className="md:w-1/6 flex flex-col gap-2 mx-4">
            <span className="mx-auto">Vyber pyčo</span>

            <TableListChooser
                href="/admin/instruments"
                active={active === 'instruments'}
                onClick={handleClick}
            >
                Nástoje
            </TableListChooser>
        </aside>
    );
}
