import db, { type Database } from '@/database';
import { SelectType } from 'kysely';

export type PartialResultEntity<T extends keyof Database> = {
    [key in keyof Database[T]]?: SelectType<Database[T][key]>;
};

export type ResultEntity<T extends keyof Database> = {
    [key in keyof Database[T]]: SelectType<Database[T][key]>;
};

export class Repository<T extends keyof Database> {
    readonly tableName: T;

    constructor(dbName: T) {
        this.tableName = dbName;
    }

    select() {
        return db.selectFrom(this.tableName);
    }

    insert() {
        return db.insertInto(this.tableName);
    }

    update(where?: number | PartialResultEntity<T>) {
        let qb = db.updateTable(this.tableName);

        if (where) {
            if (typeof where === 'number') {
                // @ts-ignore
                qb = qb.where(`${this.tableName}.id`, '=', where);
            } else {
                for (const [key, val] of Object.entries(where)) {
                    // @ts-ignore
                    qb = qb.where(`${this.tableName}.${key}`, '=', val);
                }
            }
        }

        return qb;
    }

    async findById(id: number): Promise<ResultEntity<T> | null> {
        const res = await this.select()
            .selectAll()
            // @ts-ignore
            .where(`${this.tableName}.id`, '=', id)
            .executeTakeFirst();

        if (typeof res === 'undefined') {
            return null;
        }

        return res as ResultEntity<T>;
    }

    all(offset: number = 0, limit: number = 20) {
        return this.select().limit(limit).offset(offset).selectAll();
    }

    one() {
        return this.select().limit(1).selectAll();
    }
}
