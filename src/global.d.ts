import type { Database } from '@/database';
import type { SelectType } from 'kysely';

declare global {
    type AssertDefined<T> = T extends undefined | null ? never : T;

    type ReplaceValues<TIn extends object, TWhat, TBy> = {
        [key in keyof TIn]: TWhat extends TIn[key] ? TBy : TIn[key];
    };

    type OmitKeys<TIn extends object, TWhich> = {
        [key in keyof TIn]: TWhich extends TIn[key] ? never : TIn[key];
    };

    export type PartialResultEntity<T extends keyof Database> = {
        [key in keyof Database[T]]?: SelectType<Database[T][key]>;
    };

    export type ResultEntity<T extends keyof Database> = {
        [key in keyof Database[T]]: SelectType<Database[T][key]>;
    };
}

export {};
