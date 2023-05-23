// @ts-ignore
import { TABLE_NAME } from '../src/entity/user.ts';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    const builder = db.schema.createTable(TABLE_NAME)
        .addColumn('id', 'integer', col =>
            col.unsigned().autoIncrement().primaryKey())
        .addColumn('display_name', 'varchar(512)', col =>
            col.notNull())
        .addColumn('auth_type', sql`enum('native', 'facebook')`, col =>
            col.notNull())
        .addColumn('auth_secret', 'varchar(512)', col =>
            col.notNull())
        .addColumn('roles', 'json');

    await builder.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    const builder = db.schema.dropTable(TABLE_NAME);

    await builder.execute();
}