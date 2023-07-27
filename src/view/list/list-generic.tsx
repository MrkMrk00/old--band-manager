'use client';

import type { AllHTMLAttributes, MouseEvent, ReactNode } from 'react';
import type { ColumnOptions, HeaderMapping, ObjectType } from '@/view/list/types';
import List from '@/view/list/list-layout';
import { twJoin, twMerge } from 'tailwind-merge';

type DatasetWithId = HTMLDivElement['dataset'] & {
    objectId?: `${number}`;
    objectIdx: `${number}`;
};

export type RowClickCallbackEvent = MouseEvent<HTMLDivElement & { dataset: DatasetWithId }>;
export type RowClickCallback = (ev: RowClickCallbackEvent) => void;

export type GenericListProps<T extends ObjectType> = {
    objects: T[];
    headerMapping?: HeaderMapping<T>;
    only?: (keyof T)[];
    onRowClick?: RowClickCallback;
    rowClassName?: string;
    headerClassName?: string;
} & AllHTMLAttributes<HTMLDivElement>;

function renderGenericHeader<T extends ObjectType>(
    headerMapping: HeaderMapping<T> | undefined,
    headerKeys: (keyof T)[],
): ReactNode[] {
    const elems = new Array(headerKeys.length);

    let at = 0;
    for (const key of headerKeys) {
        const isFirst = at === 0;
        const isLast = at === headerKeys.length - 1;

        const title = getKeyFromHeaderMapping(headerMapping, key, 'title');
        const className = getKeyFromHeaderMapping(headerMapping, key, 'className');

        elems[at] = (
            <List.Value
                className={twMerge(
                    isFirst ? 'rounded-tl-xl justify-start' : isLast ? 'rounded-tr-xl' : '',
                    className,
                )}
                key={at}
            >
                {title ?? (key as string)}
            </List.Value>
        );

        at++;
    }

    return elems;
}

function renderGenericListRow<T extends ObjectType>(
    keys: (keyof T)[],
    values: T,
    headerMapping?: HeaderMapping<T>,
): ReactNode {
    const elems = new Array(keys.length);

    let at = 0;
    for (const column of keys) {
        const isFirst = at === 0;
        const className = getKeyFromHeaderMapping(headerMapping, column, 'className');

        elems[at] = (
            <List.Value className={twMerge(isFirst && 'justify-start', className)} key={at}>
                {values[column]}
            </List.Value>
        );

        at++;
    }

    return elems;
}

function renderGenericListBody<T extends ObjectType>(
    objects: T[],
    keys: (keyof T)[],
    headerMapping?: HeaderMapping<T>,
    className?: string,
    onClick?: RowClickCallback,
): ReactNode[] {
    const elems: ReactNode[] = new Array(objects.length);

    let at = 0;
    for (const elem of objects) {
        if (typeof elem !== 'object') {
            continue;
        }

        elems[at] = (
            <List.Row
                className={twJoin(
                    `bg-white${onClick ? ' hover:brightness-90 cursor-pointer' : ''}`,
                    className,
                )}
                onClick={onClick}
                data-object-id={'id' in elem ? elem.id : undefined}
                data-object-idx={at}
                key={at}
            >
                {renderGenericListRow(keys, elem, headerMapping)}
            </List.Row>
        );

        at++;
    }

    return elems;
}

export default function ListView<T extends ObjectType>(props: GenericListProps<T>) {
    const { objects, headerMapping, headerClassName, only, onRowClick, rowClassName, ...rest } =
        props;

    const keys: (keyof T)[] = only ?? (objects.length === 0 ? [] : Object.keys(objects[0]));

    return (
        <List {...rest}>
            <List.Header>{renderGenericHeader(headerMapping, keys)}</List.Header>
            {renderGenericListBody(objects, keys, headerMapping, rowClassName, onRowClick)}
            <List.Row className="h-[1em] border-none"></List.Row>
        </List>
    );
}

function getKeyFromHeaderMapping<TObj extends ObjectType, TKey extends keyof ColumnOptions>(
    headerMapping: HeaderMapping<TObj> | undefined,
    column: keyof TObj,
    key: TKey,
): ColumnOptions[TKey] {
    if (!headerMapping || !(column in headerMapping)) {
        return undefined;
    }

    return key in headerMapping[column]! ? headerMapping[column]![key] : undefined;
}
