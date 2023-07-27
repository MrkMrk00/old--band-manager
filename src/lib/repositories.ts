import { Repository } from '@/lib/entity-utils/Repository';
import { toInstrument } from '@/lib/entity-utils/prototypes';
import { User } from '@/model/user';
import db, { Database } from '@/database';
import { Kysely } from 'kysely';

class UserCustomRepository extends Repository<'users'> {
    constructor() {
        super('users');
    }

    // @ts-ignore
    async findById(id: number): Promise<User | null> {
        return (await super.findById(id)) as unknown as Promise<User | null>;
    }
}

export const UsersRepository = new UserCustomRepository();
export const InstrumentsRepository = new Repository('instruments');
export { toInstrument };

export function query(): Kysely<Database> {
    return db;
}
