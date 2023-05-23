import env from './env.mjs';
import { ConnectionString } from 'connection-string';
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

const connection = new ConnectionString(env.DB_CONN);
if (!connection.path || connection.path.length !== 1) {
    throw Error(`${__filename}: No database name supplied!`);
}

const pool = createPool({
    host: connection.hostname,
    port: connection.port ?? 3306,
    user: connection.user,
    password: connection.password,
    database: connection.path[0],
    ssl: { rejectUnauthorized: env.NODE_ENV === 'production', },
});

const dialect = new MysqlDialect({ pool });

const db = new Kysely<Database>({ dialect });

export default db;