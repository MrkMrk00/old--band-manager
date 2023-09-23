import { useState } from 'react';
import type { ConfirmModalProps } from '@/view/layout-stateful';

export type ConfirmModalHookOpts = {
    onConfirm?: () => unknown;
    onReject?: () => unknown;
    innerText?: string;
};

const buttons: ConfirmModalProps['buttons'] = [
    { id: 0, children: 'Tak ne, no', rightSide: true },
    { id: 1, className: 'bg-red-500', children: 'Ano' },
];

export function useConfirmModal(opts: ConfirmModalHookOpts = {}): {
    open: () => void;
    props: ConfirmModalProps;
} {
    const [isOpen, setOpen] = useState(false);

    return {
        open: () => setOpen(true),
        props: {
            children: opts.innerText ?? 'Vážně si přeješ tuto akci vykonat?',
            title: 'Opravdu?',
            isOpen,
            buttons: buttons,
            onClose: which => {
                if (which === 1 && opts.onConfirm) {
                    opts.onConfirm();
                }

                if (which === 0) {
                    setOpen(false);
                    if (opts.onReject) opts.onReject();
                }
            },
        },
    };
}
