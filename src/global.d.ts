import type { SelectType } from 'kysely';
import type { Database } from '@/database';

declare global {
    type AssertDefined<T> = T extends undefined | null ? never : T;

    type ReplaceValues<TIn extends object, TWhat, TBy> = {
        [key in keyof TIn]: TWhat extends TIn[key] ? TBy : TIn[key];
    };

    type OmitKeys<TIn extends object, TWhich> = {
        [key in keyof TIn]: TWhich extends TIn[key] ? never : TIn[key];
    };

    /** @deprecated */
    export type PartialResultEntity<T extends keyof Database> = {
        [key in keyof Database[T]]?: SelectType<Database[T][key]>;
    };

    /** @deprecated */
    export type ResultEntity<T extends keyof Database> = {
        [key in keyof Database[T]]: SelectType<Database[T][key]>;
    };

    type RemoveIndex<T> = {
        [K in keyof T as string extends K
            ? never
            : number extends K
            ? never
            : symbol extends K
            ? never
            : K]: T[K];
    };

    type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };
}

export {};
