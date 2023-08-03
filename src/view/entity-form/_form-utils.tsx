import { AllHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type FormRowProps = {
    children?: ReactNode;
} & AllHTMLAttributes<HTMLDivElement>;

export function FormRow({ children, className, ...rest }: FormRowProps) {
    return (
        <div
            {...rest}
            className={twMerge(
                'flex flex-row w-full justify-between items-center gap-3',
                className,
            )}
        >
            {children}
        </div>
    );
}

export type FormProps = {
    id: `${number}` | 'add';
};
