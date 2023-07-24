'use client';

import type {
    AnchorHTMLAttributes,
    ComponentPropsWithRef,
    InputHTMLAttributes,
    ReactNode,
} from 'react';
import { Fragment } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { ButtonHTMLAttributes } from 'react';
import { RippleAnimation } from '@/view/_internal/client.layout';
import NextLink from 'next/link';
import { FaChevronDown, FaHouse } from 'react-icons/fa6';

export { RippleAnimation };

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...other } = props;

    return (
        <input
            className={twMerge('border border-slate-200 rounded-2xl py-2 px-4', className)}
            {...other}
        />
    );
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { children, className, ...rest } = props;

    return (
        <button
            className={twMerge(
                `rounded-2xl shadow-md transition-all
                py-2 px-4 bg-white hover:brightness-90 _with-ripple-anim`,
                className,
            )}
            {...rest}
        >
            {children}
            <RippleAnimation />
        </button>
    );
}

export function Anchor(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const { className, children, ...rest } = props;

    return (
        <a
            className={twMerge(
                `rounded-2xl shadow-md transition-all
                py-2 px-4 bg-white hover:brightness-90 _with-ripple-anim`,
                className,
            )}
            {...rest}
        >
            {children}
            <RippleAnimation />
        </a>
    );
}

export function Link(props: ComponentPropsWithRef<typeof NextLink>) {
    const { className, children, ...rest } = props;

    return (
        <NextLink
            className={twMerge(
                `rounded-2xl shadow-md transition-all
                py-2 px-4 bg-white hover:brightness-90 _with-ripple-anim`,
                className,
            )}
            {...rest}
        >
            {children}
            <RippleAnimation />
        </NextLink>
    );
}

type ModalProps = {
    title: string;
    isOpen: boolean;
    buttons?: {
        id: number;
        className?: string;
        children?: ReactNode | string;
        rightSide?: true | undefined;
    }[];
    onClose?: (which: number | undefined) => void;
    children?: ReactNode;
};

export default function Modal(props: ModalProps) {
    let { title, isOpen, onClose, children, buttons } = props;

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => onClose && onClose(undefined)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {title}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">{children}</p>
                                    </div>

                                    <div className="mt-4 flex flex-row justify-between">
                                        <div className="flex flex-row gap-2">
                                            {!!buttons &&
                                                buttons
                                                    .filter(it => !it.rightSide)
                                                    .map((val, i) => (
                                                        <Button
                                                            key={`${i}_${val.id}`}
                                                            type="button"
                                                            onClick={() =>
                                                                onClose && onClose(val.id)
                                                            }
                                                            className={val.className}
                                                            id={'Dialog__closeBtn--' + val.id}
                                                        >
                                                            {val.children}
                                                        </Button>
                                                    ))}

                                            {!buttons && (
                                                <Button
                                                    type="button"
                                                    onClick={() => onClose && onClose(undefined)}
                                                    id="Dialog__closeBtn"
                                                >
                                                    OK
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            {!!buttons &&
                                                buttons
                                                    .filter(it => it.rightSide)
                                                    .map((val, i) => (
                                                        <Button
                                                            key={`${i}_${val.id}`}
                                                            type="button"
                                                            onClick={() =>
                                                                onClose && onClose(val.id)
                                                            }
                                                            className={val.className}
                                                            id={'Dialog__closeBtn--' + val.id}
                                                        >
                                                            {val.children}
                                                        </Button>
                                                    ))}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}

type SpinnerProps = {
    size?: `${number}${'px' | 'em' | 'rem'}`;
    className?: string;
    color?: string;
};

export function LoadingSpinner({ size, className, color }: SpinnerProps) {
    size = size ?? '48px';
    color = color ?? '#FFF';

    return (
        <span
            style={{
                border: `5px solid ${color}`,
                height: size,
                width: size,
                borderBottomColor: 'transparent',
            }}
            className={`_loading-spinner${className ? ' ' + className : ''}`}
        ></span>
    );
}

export function If({ condition, children }: { condition: boolean; children: ReactNode }) {
    return <>{condition && children}</>;
}

export function DropdownMenu() {
    return (
        <div className="">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                        Options
                        <FaChevronDown
                            className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                            aria-hidden="true"
                        />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={`${
                                            active ? 'bg-violet-500 text-white' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        <FaHouse className="mr-2 h-5 w-5" aria-hidden="true" />
                                        Edit
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}
