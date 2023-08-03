import db, { type Database } from '@/database';
import type { InsertQueryBuilder, InsertResult } from 'kysely';

export class Repository<T extends keyof Database> {
    readonly tableName: T;

    constructor(dbName: T) {
        this.tableName = dbName;
    }

    selectQb() {
        return db.selectFrom(this.tableName);
    }

    insertQb(): InsertQueryBuilder<Database, T, InsertResult> {
        return db.insertInto(this.tableName);
    }

    updateQb(where?: number | PartialResultEntity<T>) {
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

    delete(where?: number | PartialResultEntity<T>) {
        let qb = db.deleteFrom(this.tableName);

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

    findById(id: number) {
        return (
            this.selectQb()
                .selectAll()
                // @ts-ignore
                .where(`${this.tableName}.id`, '=', id)
        );
    }

    all(offset: number = 0, limit: number = 20) {
        return this.selectQb().limit(limit).offset(offset).selectAll();
    }

    one() {
        return this.selectQb().limit(1).selectAll();
    }
}
