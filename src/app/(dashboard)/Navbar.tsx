import type { PersistentUser } from '@/model/user';
import Link from 'next/link';
import { AnchorHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { RippleAnimation } from '@/view/layout';
import { FaHouse } from 'react-icons/fa6';
import { FaUserCircle } from 'react-icons/fa';

type NavbarProps = {
    user: PersistentUser | null;
};

function NavLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    const { className, children, ...other } = props;

    return (
        <Link
            className={twMerge(
                `py-4 px-2 flex 
                flex-row gap-1 border-b-2
                hover:border-green-400 border-transparent hover:text-green-900
                transition-colors ease-in-out _with-ripple-anim`,
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
    return (
        <>
            <nav className="flex flex-row justify-between shadow sticky">
                <div className="flex flex-row">
                    <div className="flex flex-col justify-center px-4">
                        <h1 className="font-bold text-xl">BigBand ZUŠ Vrchlabí</h1>
                    </div>

                    <div className="flex flex-row gap-2 px-2 items-center h-100">
                        <NavLink href="/">
                            <FaHouse size="1.2em" /> Domů
                        </NavLink>
                    </div>
                </div>
                {user && (
                    <div className="flex flex-row justify-center px-4">
                        <NavLink href="/admin">Nastavení aplikace</NavLink>
                        <NavLink href="/me" className="items-center">
                            <FaUserCircle size="1.2em" />
                            <span>{user.display_name}</span>
                        </NavLink>
                    </div>
                )}
            </nav>
        </>
    );
}
