import Link from 'next/link';
import type { AnchorHTMLAttributes, FC, ReactNode } from 'react';
import { FaCircleUser, FaHouse } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import type { UserObject } from '@/model/user';

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
        </Link>
    );
}

export default function WidescreenMenu({
    navbar,
    user,
}: {
    navbar: FC<{ children: ReactNode }>;
    user?: UserObject;
}) {
    const SharedNavbar = navbar;

    return (
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
    );
}
