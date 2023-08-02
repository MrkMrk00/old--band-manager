'use client';

import type { AllHTMLAttributes, MouseEvent, ReactNode } from 'react';
import type { ColumnOptions, HeaderMapping, ObjectType } from '@/view/list/types';
import List from '@/view/list/list-layout';
import { twJoin, twMerge } from 'tailwind-merge';
import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

export type DatasetWithId = HTMLDivElement['dataset'] & {
    objectId?: `${number}`;
    objectIdx: `${number}`;
};

export type SortablePayload<T extends ObjectType> = {
    field: keyof T;
    order: 'ASC' | 'DESC';
}

type OrderByState<T extends ObjectType> = [
    orderBy: SortablePayload<T> | undefined,
    setOrderBy: (payload: SortablePayload<T> | undefined) => void,
];

export type RowClickCallbackEvent = MouseEvent<HTMLDivElement & { dataset: DatasetWithId }>;
export type RowClickCallback = (ev: RowClickCallbackEvent) => void;

export type GenericListProps<T extends ObjectType> = {
    objects: T[];
    headerMapping?: HeaderMapping<T>;
    only?: (keyof T)[];
    onRowClick?: RowClickCallback;
    rowClassName?: string;
    headerClassName?: string;
    onOrderByChange?: (payload: SortablePayload<T> | undefined) => void;
} & AllHTMLAttributes<HTMLDivElement>;

type HeaderProps<T extends ObjectType> = {
    headerMapping: HeaderMapping<T> | undefined,
    headerKeys: (keyof T)[],
    onOrderChange?: (payload: SortablePayload<T> | undefined) => void;
};

function GenericListHeader<T extends ObjectType>({ headerMapping, headerKeys, onOrderChange }: HeaderProps<T>) {
    const [orderBy, setOrderBy] = useState<SortablePayload<T> | undefined>();

    useEffect(() => {
        if (onOrderChange) {
            onOrderChange(orderBy);
        }
    }, [orderBy, onOrderChange]);

    function handleOrderChange(ev: MouseEvent<HTMLButtonElement>) {
        const key = ev.currentTarget.dataset.columnKey;
        if (!key || !setOrderBy) {
            return;
        }

        if (orderBy?.field !== key) {
            setOrderBy({ order: 'ASC', field: key });
            return;
        }

        if (orderBy?.field === key && orderBy.order === 'ASC') {
            setOrderBy({ order: 'DESC', field: key });
            return;
        }

        if (orderBy?.field === key && orderBy.order === 'DESC') {
            setOrderBy(undefined);
        }
    }

    const elems = new Array(headerKeys.length);

    let at = 0;
    for (const key of headerKeys) {
        const isFirst = at === 0;
        const isLast = at === headerKeys.length - 1;

        const className = getKeyFromHeaderMapping(headerMapping, key, 'className');
        let title: ReactNode = getKeyFromHeaderMapping(headerMapping, key, 'title');

        if (onOrderChange && title) {
            title = (
                <>
                    <span className="w-[1em] mr-1"></span>
                    <button
                        type="button"
                        className="hover:underline"
                        onClick={handleOrderChange}
                        data-column-key={key}
                    >
                        { title ?? (key) as string }
                    </button>
                    <span className="w-[1em] ml-1">
                        {orderBy?.field === key && orderBy.order === 'ASC' && (
                            <FaChevronUp />
                        )}

                        {orderBy?.field === key && orderBy.order === 'DESC' && (
                            <FaChevronDown />
                        )}
                    </span>
                </>
            );
        }

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

    return (
        <List.Header>{ elems }</List.Header>
    );
}

type RowProps<T extends ObjectType> = {
    keys: (keyof T)[],
    values: T,
    headerMapping?: HeaderMapping<T>,
    className?: string;
    onClick?: RowClickCallback,
};

function GenericListRow<T extends ObjectType>({ values, keys, headerMapping, className, onClick }: RowProps<T>) {
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

    return (
        <List.Row
            className={twJoin(
                `bg-white${onClick ? ' hover:brightness-90 cursor-pointer' : ''}`,
                className,
            )}
            onClick={onClick}
            data-object-id={'id' in values ? values.id : undefined}
            data-object-idx={at}
            key={at}
        >
            { elems }
        </List.Row>
    );
}

function renderGenericListBody<T extends ObjectType>(
    objects: T[],
    keys: (keyof T)[],
    headerMapping?: HeaderMapping<T>,
    rowClassName?: string,
    onRowClick?: RowClickCallback,
): ReactNode[] {
    const elems: ReactNode[] = new Array(objects.length);

    let at = 0;
    for (const elem of objects) {
        if (typeof elem !== 'object') {
            continue;
        }

        elems[at] = (
            <GenericListRow
                keys={keys}
                values={elem}
                headerMapping={headerMapping}
                className={rowClassName}
                onClick={onRowClick}
                key={at}
            />
        );

        at++;
    }

    return elems;
}

export default function ListView<T extends ObjectType>(props: GenericListProps<T>) {
    const {
        objects,
        headerMapping,
        headerClassName,
        only,
        onRowClick,
        rowClassName,
        onOrderByChange,
        ...rest
    } = props;

    const keys: (keyof T)[] = only ?? (objects.length === 0 ? [] : Object.keys(objects[0]));

    return (
        <List {...rest}>
            <GenericListHeader headerMapping={headerMapping} headerKeys={keys} onOrderChange={onOrderByChange} />
            {renderGenericListBody(objects, keys, headerMapping, rowClassName, onRowClick)}
            <span className="h-[1em] border-none"></span>
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
