import db, { type Database } from '@/database';
import type { AllSelection } from 'kysely/dist/esm/parser/select-parser';

type ResultEntityType<T extends keyof Database, TProto extends object> =
    AllSelection<Database, T> & TProto;

export class Repository<T extends keyof Database, TProto extends object> {
    readonly dbName: T;
    readonly #prototype: TProto | null;

    constructor(dbName: T, prototype?: TProto) {
        this.dbName = dbName;
        this.#prototype = prototype ?? null;
    }

    #applyProto(result: object): ResultEntityType<T, TProto> {
        if (this.#prototype) {
            Object.setPrototypeOf(result, this.#prototype);
        }

        return (result as unknown) as ResultEntityType<T, TProto>;
    }

    select() {
        return db.selectFrom(this.dbName);
    }

    insert() {
        return db.insertInto(this.dbName);
    }

    update() {
        return db.insertInto(this.dbName);
    }

    async findById(id: number): Promise<ResultEntityType<T, TProto> | null> {
        const res = await this.select()
            .selectAll()
            // @ts-ignore
            .where(`${this.dbName}.id`, '=', id)
            .executeTakeFirst();

        if (typeof res === 'undefined') { return null; }

        return this.#applyProto(res);
    }

    async all(offset: number = 0, limit: number = 20): Promise<ResultEntityType<T, TProto>[]> {
        const res = await this.select()
            .selectAll()
            .limit(limit)
            .offset(offset)
            .execute();

        for (const singleRes of res) {
            this.#applyProto(singleRes);
        }

        return (res as unknown) as ResultEntityType<T, TProto>[];
    }

    async findOne(): Promise<ResultEntityType<T, TProto> | null> {
        const single = await this.all(0, 1);
        if (single.length < 1) { return null; }
        return single[0];
    }
}