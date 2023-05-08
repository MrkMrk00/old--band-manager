import { ColumnDefinitionBuilderCallback, Generated, Kysely, MysqlDialect } from 'kysely';
import type { DataTypeExpression } from 'kysely/dist/esm/parser/data-type-parser';
import { createPool } from 'mysql2';

interface InstrumentGroup {
    id: Generated<number>;
    name: string;
}

interface Instrument {
    id: Generated<number>;
    name: string;
    id_instrument_group: number;
}

export interface Database {
    instrument: Instrument;
    instrument_group: InstrumentGroup;
}

export const pool = createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWD,
    user: process.env.DB_USER,
});
export const dialect = new MysqlDialect({ pool });

const db = new Kysely<Database>({ dialect });

type TPrimaryKeyDef = {
    name: string;
    type: DataTypeExpression;
    col: ColumnDefinitionBuilderCallback;
};

export const PrimaryKeyDef: TPrimaryKeyDef = {
    name: 'id',
    type: 'integer',
    col: col => col.unsigned().autoIncrement().primaryKey(),
} as const;

export default db;