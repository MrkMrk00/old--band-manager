import type {
    AnchorHTMLAttributes,
    ComponentPropsWithRef,
    InputHTMLAttributes,
    ReactNode,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { ButtonHTMLAttributes } from 'react';
import { RippleAnimation } from '@/view/layout-stateful';
import NextLink from 'next/link';

export { RippleAnimation };

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
