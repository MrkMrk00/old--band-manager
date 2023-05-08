import { Kysely } from 'kysely/dist/esm';

export async function up(db: Kysely<any>): Promise<void> {
    db.schema.createTable('users')
        .addColumn('id', 'integer', col => col.unsigned().autoIncrement().primaryKey())
        .addColumn('email', 'varchar(255)', col => col.unique())
        .addColumn('password', 'varchar(127)')
        .addColumn('auth_source', 'varchar(255)', col => col.defaultTo(null));
}

export async function down(db: Kysely<any>): Promise<void> {

}