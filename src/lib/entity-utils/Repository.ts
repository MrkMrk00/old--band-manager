import type { InsertQueryBuilder, InsertResult, Kysely } from 'kysely';
import type { Database } from '@/database';

function createAlias(tableName: string) {
    return tableName
        .split('_')
        .map(part => part.at(0)?.toLowerCase() ?? '')
        .join();
}

export class Repository<T extends keyof Database, TAlias extends string = T> {
    readonly tableName: T;
    readonly database: Kysely<Database>;
    readonly tableAlias: TAlias;

    constructor(database: Kysely<Database>, tableName: T, tableAlias?: TAlias) {
        this.database = database;
        this.tableName = tableName;
        this.tableAlias = tableAlias ?? (tableName as unknown as TAlias);
    }

    selectQb() {
        return this.database.selectFrom(`${this.tableName} as ${this.tableAlias}`);
    }

    selectAll() {
        return this.selectQb().selectAll();
    }

    insertQb(): InsertQueryBuilder<Database, T, InsertResult> {
        return this.database.insertInto(this.tableName);
    }

    updateQb(where?: number | PartialResultEntity<T>) {
        let qb = this.database.updateTable(`${this.tableName} as ${this.tableAlias}`);

        if (where) {
            if (typeof where === 'number') {
                // @ts-ignore
                qb = qb.where(`${this.tableAlias}.id`, '=', where);
            } else {
                for (const [key, val] of Object.entries(where)) {
                    // @ts-ignore
                    qb = qb.where(`${this.tableAlias}.${key}`, '=', val);
                }
            }
        }

        return qb;
    }

    deleteQb(where?: number | PartialResultEntity<T>) {
        let qb = this.database.deleteFrom(`${this.tableName} as ${this.tableAlias}`);

        if (where) {
            if (typeof where === 'number') {
                // @ts-ignore
                qb = qb.where(`${this.tableAlias}.id`, '=', where);
            } else {
                for (const [key, val] of Object.entries(where)) {
                    // @ts-ignore
                    qb = qb.where(`${this.tableAlias}.${key}`, '=', val);
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
                .where(`${this.tableAlias}.id`, '=', id)
        );
    }

    all(offset: number = 0, limit: number = 20) {
        // @ts-ignore
        return this.selectQb().limit(limit).offset(offset).selectAll(this.tableAlias);
    }

    one() {
        // @ts-ignore
        return this.selectQb().limit(1).selectAll(this.tableAlias);
    }
}
