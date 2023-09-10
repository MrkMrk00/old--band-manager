import { UserObject } from '@/model/user';
import { Menu, Transition } from '@headlessui/react';
import { FaArrowRight, FaBars, FaCircleUser, FaX } from 'react-icons/fa6';
import React, { Fragment } from 'react';
import Link from 'next/link';
import { OverlayText } from '@/view/layout';

export default function MobileMenu({ user }: { user: UserObject | null }) {
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
