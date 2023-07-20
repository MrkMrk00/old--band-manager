import { HouseIcon, UserCircleIcon } from '@/view/icons';
import type { PersistentUser } from '@/model/user';
import Link from 'next/link';
import { AnchorHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { RippleAnimation } from '@/view/layout';

type NavbarProps = {
    user: PersistentUser | null;
};

function NavLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    const { className, children, ...other } = props;

    return (
        <Link
            className={twMerge('py-4 px-2 flex flex-row gap-1 with-ripple-anim', className)}
            {...other}
        >
            {children}
            <RippleAnimation />
        </Link>
    );
}

export default function Navbar({ user }: NavbarProps) {
    return (
        <>
            <nav className="flex flex-row justify-between shadow">
                <div className="flex flex-row">
                    <div className="flex flex-col justify-center px-4">
                        <h1 className="font-bold text-xl">BigBand ZUŠ Vrchlabí</h1>
                    </div>

                    <div className="flex flex-row gap-2 px-2 items-center h-100">
                        <NavLink href="/">
                            <HouseIcon height="1.2em" /> Domů
                        </NavLink>
                    </div>
                </div>
                {user && (
                    <div className="flex flex-row justify-center px-4">
                        <NavLink href="/admin">Nastavení aplikace</NavLink>
                        <NavLink href="/me" className="items-center">
                            <UserCircleIcon />
                            <span>{user.display_name}</span>
                        </NavLink>
                    </div>
                )}
            </nav>
        </>
    );
}