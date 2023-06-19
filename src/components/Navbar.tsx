import Link from 'next/link';
import { House, UserCircle } from '@/components/icons';
import type { PersistentUser } from '@/model/user';
import { NavbarLink } from '@/components/client.NavbarLink';

type NavbarProps = {
    user: PersistentUser | null;
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
                        <NavbarLink href="/dashboard" defaultChecked>
                            <House height="1.2em"/> Domů
                        </NavbarLink>
                    </div>
                </div>
                {user && (
                    <div className="flex flex-col justify-center px-4">
                        <NavbarLink href="/dashboard/me" className="flex flex-row gap-2 items-center">
                            <UserCircle />
                            <span>{user.display_name}</span>
                        </NavbarLink>
                    </div>
                )}
            </nav>
        </>
    );
}