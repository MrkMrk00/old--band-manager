import env from './env.mjs';
import { type Generated, Kysely, MysqlDialect } from 'kysely';
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

const pool = createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWD,
    user: process.env.DB_USER,
    ssl: { rejectUnauthorized: env.NODE_ENV === 'production', },
});

const dialect = new MysqlDialect({ pool });

const db = new Kysely<Database>({ dialect });

export default db;