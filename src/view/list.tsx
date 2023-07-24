'use client';

import type {
    ReactNode,
    TableHTMLAttributes,
    MouseEvent,
    AllHTMLAttributes,
    ButtonHTMLAttributes,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { FaLeftLong, FaRightLong } from 'react-icons/fa6';
import { parseRoundedClassName, withSecondModifier } from '@/view/client.helpers';

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

    const rounded = parseRoundedClassName(rest.className);

    return (
        <table {...rest}>
            <thead>
                <tr style={{ lineHeight: '24px' }}>
                    {(only ?? Object.keys(objects[0])).map((key, idx, arr) => {
                        const isFirst = idx === 0;
                        const isLast = idx === arr.length - 1;

                        key = key as string;
                        const title = (
                            headerMapping ? headerMapping[key as keyof T]?.title ?? key : key
                        ) as string;

                        return (
                            <th
                                className={twMerge(
                                    `px-4 py-2 h-[30px] ${headerClassName}`,
                                    !isFirst
                                        ? ''
                                        : `text-left${
                                              rounded ? ' ' + withSecondModifier(rounded, 'tl') : ''
                                          }`,
                                    !isLast
                                        ? ''
                                        : rounded
                                        ? ' ' + withSecondModifier(rounded, 'tr')
                                        : '',
                                )}
                                key={key}
                            >
                                {title}
                            </th>
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
                                `bg-white${
                                    !!onRowClick ? ' hover:cursor-pointer hover:brightness-90' : ''
                                }`,
                                rowClassName,
                            )}
                        >
                            {(only ?? Object.keys(obj)).map(function (key, idx2) {
                                return (
                                    <td
                                        className={`px-4 py-2 h-[24px] border-t border-t-gray-300${
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
    onPageChange: (page: number) => void;
    btnClassName?: string;
};

function PagerButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { disabled?: boolean }) {
    const { className, children, disabled, ...restProps } = props;

    return (
        <button
            {...restProps}
            className={twMerge(
                'w-full h-full px-4 py-2 border inline-flex justify-center items-center transition-all',
                className,
                disabled ? 'pointer-events-none' : 'hover:brightness-90',
            )}
        >
            {children}
        </button>
    );
}

function Pager({
    maxPage,
    curPage,
    className,
    onPageChange,
    btnClassName,
    ...divProps
}: PagerProps) {
    return (
        <div
            {...divProps}
            className={twMerge('flex flex-row rounded-xl items-center bg-white', className)}
        >
            <PagerButton
                disabled={curPage === 1}
                className="rounded-l-xl bg-inherit"
                onClick={() => {
                    if (curPage <= 1) {
                        return;
                    }
                    onPageChange(curPage - 1);
                }}
            >
                {curPage > 1 ? <FaLeftLong /> : <span className="w-[1em] h-[1em]"></span>}
            </PagerButton>
            <div className="px-4 py-2 border-y bg-inherit whitespace-nowrap">
                <span className="font-bold">{curPage}</span> <small>z {maxPage}</small>
            </div>
            <PagerButton
                className="rounded-r-xl bg-inherit"
                disabled={curPage === maxPage}
                onClick={() => {
                    if (curPage >= maxPage) {
                        return;
                    }
                    onPageChange(curPage + 1);
                }}
            >
                {curPage < maxPage ? <FaRightLong /> : <span className="w-[1em] h-[1em]"></span>}
            </PagerButton>
        </div>
    );
}

ListView.Pager = Pager;

export default ListView;
