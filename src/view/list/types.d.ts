import type { ReactNode } from 'react';

export type ColumnOptions = {
    title?: string | number;
    className?: string;
};

export type ObjectType = Record<string, ReactNode | undefined>;
export type HeaderMapping<T extends ObjectType> = Partial<Record<keyof T, ColumnOptions>>;
