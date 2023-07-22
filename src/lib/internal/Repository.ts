import db, { type Database } from '@/database';
import type { InsertQueryBuilder, InsertResult, SelectArg, SelectExpression } from 'kysely';
import { ExtractTableAlias } from 'kysely/dist/cjs/parser/table-parser';

export class Repository<T extends keyof Database> {
    readonly tableName: T;

    constructor(dbName: T) {
        this.tableName = dbName;
    }

    selectQb(
        what?: SelectArg<
            Database,
            ExtractTableAlias<Database, T>,
            SelectExpression<Database, ExtractTableAlias<Database, T>>
        >,
    ) {
        let qb = db.selectFrom(this.tableName);
        if (what) {
            qb = qb.select(what);
        }

        return qb;
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

    async findById(id: number): Promise<ResultEntity<T> | null> {
        const res = await this.selectQb()
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
        return this.selectQb().limit(limit).offset(offset).selectAll();
    }

    one() {
        return this.selectQb().limit(1).selectAll();
    }
}
