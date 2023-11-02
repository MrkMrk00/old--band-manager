import { Button, LoadingSpinner } from '@/view/layout';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function EntityFormSaveButton(
    props: ButtonHTMLAttributes<HTMLButtonElement> & { isSaving: boolean },
) {
    const { className, isSaving, children, ...restProps } = props;

    const [text, setText] = useState<ReactNode>('Uložit');

    useEffect(() => {
        if (!isSaving && typeof text !== 'string') {
            setText('Uloženo!');

            setTimeout(() => setText('Uložit'), 1000);
        }

        if (isSaving) {
            setText(<LoadingSpinner size="1em" color="black" />);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSaving]);

    return (
        <Button
            type="submit"
            className={twMerge('bg-green-300 w-[100px]', className)}
            {...restProps}
        >
            {text}
        </Button>
    );
}
