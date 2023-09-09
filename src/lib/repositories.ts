import { Repository } from '@/lib/entity-utils/Repository';
import db, { type Database } from '@/database';
import type { Kysely } from 'kysely';

export const UsersRepository = new Repository('users');
export const InstrumentsRepository = new Repository('instruments');

export function query(): Kysely<Database> {
    return db;
}
