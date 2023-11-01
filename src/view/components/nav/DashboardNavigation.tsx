'use client';

import WidescreenMenu from './WidescreenMenu';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { type HTMLAttributes, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { isMobile } from '@/view/client.helpers';
import { useUser } from '@/view/context';

const MobileMenu = dynamic(() => import('./MobileMenu'), {
    loading: () => <SharedNavbar />,
});

function SharedNavbar({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <nav
            {...props}
            className={twMerge(
                `flex flex-row justify-between shadow sticky h-16 shrink-0 z-10 overflow-x-clip`,
                className,
            )}
        >
            <div className="flex flex-col justify-center px-4 max-w-[40%] min-w-fit">
                <h1 className="font-bold text-xl">
                    <NextLink href="/" className="hover:underline">
                        BigBand ZUŠ Vrchlabí
                    </NextLink>
                </h1>
            </div>

            {children}
        </nav>
    );
}

export default function Navigation() {
    const user = useUser();
    const [display, setDisplay] = useState<'mobile' | 'wide'>('wide');

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
            {display === 'wide' && <WidescreenMenu user={user} navbar={SharedNavbar} key="wide" />}

            {display === 'mobile' && <MobileMenu user={user} navbar={SharedNavbar} key="mobile" />}
        </>
    );
}
