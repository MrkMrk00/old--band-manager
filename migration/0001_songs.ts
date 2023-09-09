// @ts-ignore
import * as u from '../script/migrationUtil.ts';
import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    const songBuilder = db.schema.createTable('songs')
        .addColumn('id', 'serial', c => c.primaryKey())
        .addColumn('number', 'varchar(63)', c => c.notNull())
        .addColumn('name', 'varchar(255)', c => c.notNull())
        .addColumn('composer', 'varchar(255)', c => c.defaultTo(null))
        .addColumn('arranger', 'varchar(255)', c => c.defaultTo(null))
        .addColumn('link', 'varchar(1023)', c => c.defaultTo(null))
        .addColumn('custom_data', 'json', c => c.defaultTo(null))
        .addColumn('created_by', 'bigint', c => c.unsigned().notNull())
        .$call(u.timestamps);

    const sheetMusicBuilder = db.schema.createTable('sheets')
        .addColumn('id', 'serial', c => c.primaryKey())
        .addColumn('id_song', 'integer', c => c.unsigned().notNull())
        .addColumn('id_instrument', 'integer', c => c.unsigned())
        .addColumn('link', 'varchar(1023)')
        .addColumn('format', 'varchar(20)', c => c.defaultTo('pdf'))
        .addColumn('description', 'varchar(255)', c => c.defaultTo(null))
        .addColumn('custom_data', 'json', c => c.defaultTo(null))
        .addColumn('created_by', 'bigint', c => c.unsigned().notNull())
        .$call(u.timestamps);


    await songBuilder.execute();
    await sheetMusicBuilder.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('songs').execute();
    await db.schema.dropTable('sheets').execute();
}
