'use client';

import type { UserObject } from '@/model/user';
import React, { AnchorHTMLAttributes, Fragment, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { RippleAnimation } from '@/view/layout-stateful';
import { FaBars, FaHouse, FaCircleUser, FaX, FaArrowRight } from 'react-icons/fa6';
import { Menu, Transition } from '@headlessui/react';
import { If, OverlayText } from '@/view/layout';
import Link from 'next/link';

type NavbarProps = {
    user: UserObject | null;
};

function MobileMenu({ user }: NavbarProps) {
    return (
        <Menu as="div" className="flex justify-center items-center h-full">
            <Menu.Button className="flex flex-col justify-center items-center h-full w-20 border-l-2">
                <FaBars size="2em" />
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
            >
                <Menu.Items
                    className="absolute right-0 top-0
                    w-2/3 h-screen
                    bg-white shadow
                    flex flex-col justify-between"
                    as="aside"
                >
                    <div className="flex flex-col w-full h-full">
                        <Menu.Item>
                            {() => (
                                <div className="flex flex-row justify-end h-16">
                                    <span className="flex flex-col justify-center items-center h-full w-20 border-l-2">
                                        <FaX size="2rem" className="text-red-500" />
                                    </span>
                                </div>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {() => (
                                <Link
                                    href="/"
                                    className="relative w-full text-center py-4 border-y"
                                >
                                    Domů
                                    <OverlayText className="justify-end">
                                        <FaArrowRight />
                                    </OverlayText>
                                </Link>
                            )}
                        </Menu.Item>
                    </div>

                    <div className="flex flex-col justify-end w-full h-full">
                        {user?.roles.some(r => r === 'ADMIN' || r === 'SUPER_ADMIN') && (
                            <Menu.Item>
                                {() => (
                                    <Link
                                        href="/admin"
                                        className="relative w-full text-center py-4 border-t underline decoration-red-500"
                                        title="Vidí pouze administrátor"
                                    >
                                        Nastavení aplikace
                                        <OverlayText className="justify-end">
                                            <FaArrowRight />
                                        </OverlayText>
                                    </Link>
                                )}
                            </Menu.Item>
                        )}

                        <Menu.Item>
                            {() => (
                                <Link
                                    href="/me"
                                    className="relative flex flex-row justify-center gap-3 w-full text-center py-4 border-t"
                                >
                                    <span className="flex justify-center items-center">
                                        <FaCircleUser size="1.5em" />
                                    </span>
                                    <span>{user?.display_name}</span>
                                    <OverlayText className="justify-end">
                                        <FaArrowRight />
                                    </OverlayText>
                                </Link>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}

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

function isMobile(): boolean {
    return window.innerWidth <= 768;
}

export default function Navbar({ user }: NavbarProps) {
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
            <nav className="flex flex-row justify-between shadow sticky h-16 shrink-0 z-10 overflow-x-clip">
                <div className="flex flex-col justify-center px-4 max-w-[40%]">
                    <h1 className="font-bold text-xl">
                        <a href="/" className="hover:underline">
                            BigBand ZUŠ Vrchlabí
                        </a>
                    </h1>
                </div>

                <If condition={display === 'mobile'}>
                    <MobileMenu user={user} />
                </If>

                <If condition={display === 'wide'}>
                    <div className="flex flex-row gap-2 px-2 items-center h-100">
                        <NavLink href="/">
                            <FaHouse size="1.2em" /> Domů
                        </NavLink>
                    </div>
                    {user && (
                        <div className="flex flex-row justify-center px-4">
                            <NavLink href="/admin">Nastavení aplikace</NavLink>
                            <NavLink href="/me" className="items-center">
                                <FaCircleUser size="1.2em" />
                                <span>{user.display_name}</span>
                            </NavLink>
                        </div>
                    )}
                </If>
            </nav>
        </>
    );
}
