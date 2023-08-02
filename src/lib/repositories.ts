import { Repository } from '@/lib/entity-utils/Repository';
import { toInstrument } from '@/lib/entity-utils/prototypes';
import db, { Database } from '@/database';
import { Kysely } from 'kysely';

export const UsersRepository = new Repository('users');
export const InstrumentsRepository = new Repository('instruments');
export { toInstrument };

export function query(): Kysely<Database> {
    return db;
}
