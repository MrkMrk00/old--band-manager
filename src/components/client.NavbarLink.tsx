'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

function handleOnClick(ev: MouseEvent<HTMLAnchorElement>) {
    for (const navlink of document.querySelectorAll('[data-navlink]')) {
        navlink.classList.remove('active');
    }

    ev.currentTarget.classList.add('active');
}

export function NavbarLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; }) {
    const { className, defaultChecked, ...other } = props;

    return (
        <Link onClick={handleOnClick} data-navlink className={twMerge(`${defaultChecked && 'active '}py-4 px-2 flex flex-row gap-1`, className)} {...other} />
    );
}
