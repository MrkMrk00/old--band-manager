'use client';

import { Fragment, type InputHTMLAttributes, type ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { ButtonHTMLAttributes } from 'react';
import { RippleAnimation } from '@/view/_internal/client.layout';

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
    const { className, children, ...other } = props;

    return (
        <button
            className={twMerge(
                `rounded-2xl shadow-md transition-all
                py-2 px-4 bg-white hover:brightness-90 _with-ripple-anim`,
                className,
            )}
            {...other}
        >
            {children}
            <RippleAnimation />
        </button>
    );
}

type ModalProps = {
    title: string;
    isOpen: boolean;
    buttons?: { id: number; className?: string; children?: ReactNode | string; rightSide?: true|undefined }[];
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
                                                buttons.filter(it => !it.rightSide).map((val, i) => (
                                                    <Button
                                                        key={`${i}_${val.id}`}
                                                        type="button"
                                                        onClick={() => onClose && onClose(val.id)}
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
                                                buttons.filter(it => it.rightSide).map((val, i) => (
                                                    <Button
                                                        key={`${i}_${val.id}`}
                                                        type="button"
                                                        onClick={() => onClose && onClose(val.id)}
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
