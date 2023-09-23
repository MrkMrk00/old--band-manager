import env from './env.mjs';
import { ConnectionString } from 'connection-string';
import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import type { InstrumentGroupingDatabase } from '@/model/instrument_groupings';
import type { InstrumentDatabase } from '@/model/instruments';
import type { SheetDatabase, SongDatabase } from '@/model/songs';
import type { UserDatabase } from '@/model/user';

export type CustomData = Record<string, string | number | null> | null;

export interface Database {
    users: UserDatabase;
    instruments: InstrumentDatabase;
    instrument_groupings: InstrumentGroupingDatabase;
    instruments_groupings_relations: { id_instrument: number; id_grouping: number };

    songs: SongDatabase;
    sheets: SheetDatabase;
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
    ssl: { rejectUnauthorized: env.NODE_ENV === 'production' },
});

const db = new Kysely<Database>({
    dialect: new MysqlDialect({ pool }),
    log: env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
});

export default db;
