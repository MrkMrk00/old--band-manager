'use client';

import NextLink from 'next/link';
import type {
    AnchorHTMLAttributes,
    ComponentPropsWithRef,
    HTMLAttributes,
    InputHTMLAttributes,
    ReactNode,
} from 'react';
import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { wrapRippleOnClick } from '@/view/layout-stateful';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...other } = props;

    return (
        <input
            className={twMerge(
                'border-2 border-slate-200 rounded-2xl py-2 px-4 focus:outline-none focus:border-green-300',
                className,
            )}
            {...other}
        />
    );
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { children, className, onClick, ...rest } = props;

    return (
        <button
            className={twMerge(
                `rounded-2xl shadow-md transition-all
                py-2 px-4 bg-white hover:brightness-90 bm-clickable`,
                className,
            )}
            onClick={wrapRippleOnClick(onClick)}
            {...rest}
        >
            {children}
        </button>
    );
}

export function Anchor(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const { className, children, onClick, ...rest } = props;

    return (
        <a
            className={twMerge(
                `rounded-2xl shadow-md transition-all
                py-2 px-4 bg-white hover:brightness-90 bm-clickable`,
                className,
            )}
            onClick={wrapRippleOnClick(onClick)}
            {...rest}
        >
            {children}
        </a>
    );
}

export function Link(props: ComponentPropsWithRef<typeof NextLink>) {
    const { className, children, onClick, ...rest } = props;

    return (
        <NextLink
            className={twMerge(
                `rounded-2xl shadow-md transition-all
                py-2 px-4 bg-white hover:brightness-90 bm-clickable`,
                className,
            )}
            onClick={wrapRippleOnClick(onClick)}
            {...rest}
        >
            {children}
        </NextLink>
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
            className={`bm-loading-spinner${className ? ' ' + className : ''}`}
        ></span>
    );
}

export function If({ condition, children }: { condition: boolean; children: ReactNode }) {
    return <>{condition && children}</>;
}

export function OverlayText({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            className={twMerge(
                'absolute top-0 left-0 w-full h-full inline-flex justify-start items-center px-4',
                className,
            )}
            {...rest}
        >
            {children}
        </span>
    );
}
