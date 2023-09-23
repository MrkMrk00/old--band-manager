'use client';

import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { type HTMLAttributes, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { isMobile } from '@/view/client.helpers';
import { LoadingSpinner } from '@/view/layout';
import trpc from '@/lib/trcp/client';

const MobileMenu = dynamic(() => import('./MobileMenu'), {
    loading: () => <SharedNavbar />,
});

const WidescreenMenu = dynamic(() => import('./WidescreenMenu'), {
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
    const { data: user} = trpc.users.me.useQuery();
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
            {display === 'not-mounted' && (
                <SharedNavbar>
                    <div className="flex flex-row px-4 items-center">
                        <LoadingSpinner size="2em" color="black" />
                    </div>
                </SharedNavbar>
            )}

            {display === 'wide' && <WidescreenMenu user={user} navbar={SharedNavbar} />}

            {display === 'mobile' && <MobileMenu user={user} navbar={SharedNavbar} />}
        </>
    );
}
