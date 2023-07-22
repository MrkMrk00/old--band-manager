'use client';

import type { ReactNode, TableHTMLAttributes, MouseEvent, AllHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { FaLeftLong, FaRightLong } from 'react-icons/fa6';

export type ObjectType = Record<string, ReactNode | undefined>;
export type OnRowClickCallback<T extends ObjectType> = (ev: {
    event: MouseEvent<HTMLTableRowElement>;
    payload: T;
}) => void;
export type OnRowClickCallbackParameter<TData extends ObjectType> = Parameters<
    OnRowClickCallback<TData>
>[0];

export type ListViewProps<T extends ObjectType> = {
    objects: T[];
    headerMapping?: Record<keyof T, { title?: string | number }>;
    only?: (keyof T)[];
    onRowClick?: OnRowClickCallback<T>;
    rowClassName?: string;
    headerClassName?: string;
} & TableHTMLAttributes<HTMLTableElement>;

function ListView<T extends ObjectType>(props: ListViewProps<T>) {
    const { objects, headerMapping, headerClassName, only, onRowClick, rowClassName, ...rest } =
        props;

    if (objects.length < 1) {
        return <table {...rest}></table>;
    }

    return (
        <table {...rest}>
            <thead>
                <tr>
                    {(only ?? Object.keys(objects[0])).map((key, idx) => {
                        key = key as string;
                        const title = (
                            headerMapping ? headerMapping[key as keyof T]?.title ?? key : key
                        ) as string;

                        return (
                            <td
                                className={twMerge(
                                    `px-4 py-2 font-bold${idx === 0 ? ' text-left' : ''}`,
                                    headerClassName,
                                )}
                                key={key}
                            >
                                {title}
                            </td>
                        );
                    })}
                </tr>
            </thead>
            <tbody>
                {objects.map((obj, idx) => {
                    return (
                        <tr
                            key={idx}
                            onClick={
                                !!onRowClick
                                    ? e => onRowClick!({ event: e, payload: obj })
                                    : undefined
                            }
                            className={twMerge(
                                `bg-white ${
                                    !!onRowClick ? 'hover:cursor-pointer hover:brightness-90' : ''
                                }`,
                                rowClassName,
                            )}
                        >
                            {(only ?? Object.keys(obj)).map(function (key, idx2) {
                                return (
                                    <td
                                        className={`px-4 py-2 border-t border-t-gray-300${
                                            idx2 === 0 ? ' text-left' : ''
                                        }`}
                                        key={idx2}
                                    >
                                        {obj[key as keyof T]}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}

                <tr className="h-[1em]"></tr>
            </tbody>
        </table>
    );
}

type PagerProps = OmitKeys<AllHTMLAttributes<HTMLDivElement>, 'children'> & {
    maxPage: number;
    curPage: number;
    onChange: (page: number) => void;
    btnClassName?: string;
};

function PagerButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { className, children, ...restProps } = props;

    return (
        <button
            {...restProps}
            className={twMerge('w-full h-full px-4 py-2 cursor-pointer hover:brightness-90 border inline-flex justify-center items-center', className)}
        >
            { children }
        </button>
    );
}

function Pager({ maxPage, curPage, className, onChange, btnClassName, ...divProps }: PagerProps) {

    return (
        <div
            {...divProps}
            className={twMerge('flex flex-row rounded-xl items-center bg-white', className)}
        >
            <PagerButton
                className="rounded-l-xl"
                onClick={() => {
                if (curPage <= 1) { return; }
                onChange(curPage - 1);
            }}>
                <FaLeftLong />
            </PagerButton>
            <div className="px-4 py-2 border-y">
                { curPage }
            </div>
            { curPage !== maxPage && (
                <div className="p-4">
                    { maxPage }
                </div>
            )}
            <PagerButton className="rounded-r-xl">
                <FaRightLong />
            </PagerButton>
        </div>
    );
}

ListView.Pager = Pager;

export default ListView;