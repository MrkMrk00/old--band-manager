'use client';

import type { MouseEvent, TableHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { parseRoundedClassName, withSecondModifier } from '@/view/client.helpers';
import type { HeaderMapping, ObjectType } from '@/view/list/types';
import Pager from '@/view/list/pager';

/** @deprecated */
export type OnRowClickCallback<T extends ObjectType> = (ev: {
    event: MouseEvent<HTMLTableRowElement>;
    payload: T;
}) => void;

/** @deprecated */
export type OnRowClickCallbackParameter<TData extends ObjectType> = Parameters<
    OnRowClickCallback<TData>
>[0];

/** @deprecated */
export type TableViewProps<T extends ObjectType> = {
    objects: T[];
    headerMapping?: HeaderMapping<T>;
    only?: (keyof T)[];
    onRowClick?: OnRowClickCallback<T>;
    rowClassName?: string;
    headerClassName?: string;
} & TableHTMLAttributes<HTMLTableElement>;

/** @deprecated */
export default function TableView<T extends ObjectType>(props: TableViewProps<T>) {
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

/** @deprecated */
TableView.Pager = Pager;
