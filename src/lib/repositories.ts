import { Repository } from '@/lib/entity-utils/Repository';
import { asInstrument, asUser } from '@/lib/entity-utils/prototypes';
import db, { type Database } from '@/database';
import type { Kysely } from 'kysely';

export const UsersRepository = new Repository('users');
export const InstrumentsRepository = new Repository('instruments');

export { asInstrument, asUser };

export function query(): Kysely<Database> {
    return db;
}
