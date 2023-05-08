// @ts-ignore
import { PrimaryKeyDef } from '../database.ts';
import { Kysely } from 'kysely';

/*
interface InstrumentGroup {
    id: Generated<number>;
    name: string;
}

interface Instrument {
    id: Generated<number>;
    name: string;
    id_instrument_group: number;
}
*/

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('instrument_group')
        .addColumn(PrimaryKeyDef.name, PrimaryKeyDef.type, PrimaryKeyDef.col)
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .execute();

    await db.schema.createTable('instrument')
        .addColumn(PrimaryKeyDef.name, PrimaryKeyDef.type, PrimaryKeyDef.col)
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('id_instrument_group', PrimaryKeyDef.type, col =>
            col.references('instrument_group.id').onDelete('no action').onUpdate('cascade'))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('instrument_group').execute();
    await db.schema.dropTable('instrument').execute();
}