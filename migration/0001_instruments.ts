//@ts-ignore
import { timestamps } from '../script/migrationUtil.ts';
import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
    const instruments = db.schema.createTable('instruments')
        .addColumn('id', 'integer', col => col.unsigned().primaryKey().autoIncrement())
        .addColumn('name', 'varchar(512)', col => col.notNull())
        .addColumn('subname', 'varchar(512)', col => col.defaultTo(null))
        .addColumn('created_by', 'integer', col => col.unsigned().notNull())
        .addColumn('icon', 'varchar(2048)', col => col.defaultTo(null))
        .addColumn('groupings', 'json')
        .$call(timestamps);

    const groupings = db.schema.createTable('instrument_groupings')
        .addColumn('id', 'integer', col => col.unsigned().primaryKey().autoIncrement())
        .addColumn('name', 'varchar(255)', col => col.unique().notNull())
        .addColumn('created_by', 'integer', col => col.unsigned().notNull())
        .$call(timestamps);

    await instruments.execute();
    await groupings.execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable('instruments').execute();
    await db.schema.dropTable('instrument_groupings').execute();
}