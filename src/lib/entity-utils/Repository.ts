import type { InsertQueryBuilder, InsertResult, Kysely } from 'kysely';
import { ExtractTableAlias } from 'kysely/dist/cjs/parser/table-parser';
import type { Database } from '@/database';
import { Pager } from '@/lib/pager';
import { countAll } from '@/lib/specs';

export class Repository<T extends keyof Database> {
    readonly tableName: T;
    readonly database: Kysely<Database>;

    constructor(database: Kysely<Database>, tableName: T) {
        this.database = database;
        this.tableName = tableName;
    }

    select() {
        return this.database.selectFrom(this.tableName);
    }

    selectAll() {
        return this.select().selectAll(this.tableName as ExtractTableAlias<Database, T>);
    }

    insert(): InsertQueryBuilder<Database, T, InsertResult> {
        return this.database.insertInto(this.tableName);
    }

    update(id?: number) {
        let qb = this.database.updateTable(this.tableName);

        if (typeof id !== 'undefined') {
            // @ts-ignore
            qb = qb.where(`${this.tableName}.id`, '=', 'id');
        }

        return qb;
    }

    remove(id?: number) {
        let qb = this.database.deleteFrom(this.tableName);

        if (typeof id !== 'undefined') {
            // @ts-ignore
            qb = qb.where(`${this.tableName}.id`, '=', id);
        }

        return qb;
    }

    findById(id: number) {
        // @ts-ignore
        return this.one().where(`${this.tableName}.id`, '=', id);
    }

    all(offset: number = 0, limit: number = 20) {
        // @ts-ignore
        return this.select().limit(limit).offset(offset).selectAll(this.tableName);
    }

    one() {
        return this.selectAll().limit(1);
    }

    async paged(
        optsOrCurrentPage: number | { page: number; perPage: number } = 1,
        perPage: number = 20,
    ) {
        let currentPage: number;

        if (typeof optsOrCurrentPage === 'object') {
            currentPage = optsOrCurrentPage.page;
            perPage = optsOrCurrentPage.perPage;
        } else {
            currentPage = optsOrCurrentPage;
        }

        const allCount = await countAll(this.tableName);

        return Pager.handleQuery(this.selectAll(), allCount, perPage, currentPage);
    }
}
