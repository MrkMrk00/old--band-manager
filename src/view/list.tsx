'use client';

import type { ReactNode, TableHTMLAttributes, MouseEvent } from 'react';
import { twMerge } from 'tailwind-merge';

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

export function ListView<T extends ObjectType>(props: ListViewProps<T>) {
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
