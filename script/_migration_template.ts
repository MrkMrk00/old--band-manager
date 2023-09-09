// @ts-ignore
import * as u from '../script/migrationUtil.ts';
import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    const builder = db.schema.createTable('{{TABLE_NAME}}')
        .addColumn('id', 'serial', c => c.primaryKey())
        .$call(u.timestamps);

    await builder.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    const builder = db.schema.dropTable('{{TABLE_NAME}}');

    await builder.execute();
}
