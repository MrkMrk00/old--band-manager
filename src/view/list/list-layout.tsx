import type { AllHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

function ListField({ className, children, ...rest }: AllHTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={twMerge(
                'px-4 py-2 inline-flex flex-row justify-center items-center w-full',
                className,
            )}
            {...rest}
        >
            {children}
        </div>
    );
}

function ListHeader({ className, children, ...rest }: AllHTMLAttributes<HTMLDivElement>) {
    return (
        <ListRow className={twMerge('rounded-t-xl bg-slate-200 font-bold', className)} {...rest}>
            {children}
        </ListRow>
    );
}

function ListRow({ className, children, ...rest }: AllHTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={twMerge('flex flex-row justify-between border-t h-[3em]', className)}
            {...rest}
        >
            {children}
        </div>
    );
}

function List(props: AllHTMLAttributes<HTMLDivElement>) {
    const { children, className, ...rest } = props;

    return (
        <div className={twMerge('flex flex-col rounded-xl shadow-md', className)} {...rest}>
            {children}
        </div>
    );
}

List.Row = ListRow;
List.Header = ListHeader;
List.Value = ListField;

export default List;
