'use client';

import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '@/view/layout';
import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

function createRipple(event: MouseEvent<HTMLElement>) {
    const button = event.currentTarget;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];

    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

export function RippleAnimation() {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!ref.current?.parentElement) {
            return;
        }
        const parent = ref.current.parentElement;

        // @ts-ignore
        parent.addEventListener('click', createRipple);
        if (!parent.classList.contains('_with-ripple-anim')) {
            parent.classList.add('_with-ripple-anim');
        }

        ref.current.remove();
    });

    return <span ref={ref} />;
}

export type ModalProps = {
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

export function Modal(props: ModalProps) {
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