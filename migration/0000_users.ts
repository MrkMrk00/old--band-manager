//@ts-ignore
import { timestamps } from '../script/migrationUtil.ts';
import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    const builder = db.schema.createTable('users')
        .addColumn('id', 'integer', c => c.unsigned().autoIncrement().primaryKey())
        .addColumn('display_name', 'varchar(512)', c => c.notNull())
        .addColumn('email', 'varchar(512)', c => c.unique().defaultTo(null))
        .addColumn('password', 'varchar(255)', c => c.defaultTo(null))
        .addColumn('fb_id', 'bigint', c => c.defaultTo(null))
        .addColumn('roles', 'json')
        .$call(timestamps);

    await builder.execute();

    db.insertInto('users')
        .values({

        });
}

export async function down(db: Kysely<any>): Promise<void> {
    const builder = db.schema.dropTable('users');
    await builder.execute();
}