'use client';

import type { UserObject } from '@/model/user';
import { type AnchorHTMLAttributes, HTMLAttributes, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { RippleAnimation } from '@/view/layout-stateful';
import { FaHouse, FaCircleUser } from 'react-icons/fa6';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { isMobile } from '@/view/client.helpers';

const MobileMenu = dynamic(() => import('./MobileMenu'));

type NavbarProps = {
    user: UserObject | null;
};

function SharedNavbar({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <nav {...props} className={twMerge(
            `flex flex-row justify-between shadow sticky h-16 shrink-0 z-10 overflow-x-clip`,
            className
        )}>
            <div className="flex flex-col justify-center px-4 max-w-[40%] min-w-fit">
                <h1 className="font-bold text-xl">
                    <a href="/" className="hover:underline">
                        BigBand ZUŠ Vrchlabí
                    </a>
                </h1>
            </div>

            { children }
        </nav>
    );
}

function NavLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    const { className, children, ...other } = props;

    return (
        <Link
            className={twMerge(
                `py-4 px-2 flex 
                flex-row gap-1 border-b-2 items-center
                hover:border-green-400 border-transparent hover:text-green-900
                transition-colors ease-in-out`,
                className,
            )}
            {...other}
        >
            {children}
            <RippleAnimation />
        </Link>
    );
}

export default function Navbar({ user }: NavbarProps) {
    const [display, setDisplay] = useState<'mobile' | 'wide' | 'not-mounted'>('not-mounted');

    useEffect(() => {
        const listener = function () {
            setDisplay(isMobile() ? 'mobile' : 'wide');
        };

        // initialize state
        listener();

        window.addEventListener('resize', listener);

        return () => window.removeEventListener('resize', listener);
    }, []);

    return (
        <>
            {display === 'wide' && (
                <SharedNavbar>
                    <div className="flex flex-row w-full">
                        <NavLink href="/">
                            <FaHouse size="1.2em" /> Domů
                        </NavLink>
                    </div>
                    {user && (
                        <div className="flex flex-row justify-end px-4 w-full">
                            <NavLink href="/admin">Nastavení aplikace</NavLink>
                            <NavLink href="/me" className="items-center">
                                <FaCircleUser size="1.2em" />
                                <span>{user.display_name}</span>
                            </NavLink>
                        </div>
                    )}
                </SharedNavbar>
            )}

            {display === 'mobile' && (
                <MobileMenu user={user} navbar={SharedNavbar} />
            )}
        </>
    );
}
