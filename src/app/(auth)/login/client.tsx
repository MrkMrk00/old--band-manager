'use client';

import { Button, OverlayText } from '@/view/layout';
import { Modal } from '@/view/layout-stateful';
import { useSearchParams } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

function focusEmail() {
    window.setTimeout(() => {
        const elem = document.querySelector('[name="email"]');
        if (elem) {
            (elem as HTMLElement).focus();
            return;
        } else {
            focusEmail();
        }
    }, 100);
}

export function ModalMounter({ children }: { children: ReactNode }) {
    const search = useSearchParams();
    const [isOpen, setOpen] = useState<boolean>(search.has('err_str'));

    // jakoby fuj, ale co už
    useEffect(() => {
        if (isOpen && !search.has('err_str')) {
            focusEmail();
        }
        // eslint-disable-next-line
    }, [isOpen]);

    return (
        <>
            <Button className="py-4 border-2 w-full text-center" onClick={() => setOpen(o => !o)}>
                <OverlayText className="font-bold text-2xl px-6">@</OverlayText>
                Přihlásit se e-mailem
            </Button>
            <Modal isOpen={isOpen}>
                <div className="w-full flex flex-row justify-end">
                    <Button
                        onClick={() => setOpen(false)}
                        className="text-white rounded-md bg-red-500"
                    >
                        X
                    </Button>
                </div>

                {search.getAll('err_str').map((e, i) => (
                    <span key={i} className="font-bold text-red-600">
                        {e}
                    </span>
                ))}

                {children}
            </Modal>
        </>
    );
}
