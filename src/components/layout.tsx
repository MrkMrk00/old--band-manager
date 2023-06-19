import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { className, children, ...other } = props;

    return (
        <button
            className={twMerge(
                `rounded-2xl shadow-md transition-all
                py-2 px-4 bg-white hover:brightness-90`,
                className,
            )}
            {...other}
        >
            {children}
        </button>
    );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...other } = props;

    return (
        <input
            className={twMerge('border border-slate-200 rounded-2xl py-2 px-4', className)}
            {...other}
        />
    );
}
