import type { Kysely } from 'kysely';
import type { Database } from '@/database';
import db from '@/database';
import { Repository } from '@/lib/entity-utils/Repository';
import Logger from '@/lib/logger';
import InstrumentsRepositoryClass from '@/lib/repository/InstrumentsRepository';
import UsersRepositoryClass from '@/lib/repository/UsersRepository';

const logger = Logger.fromEnv();

export type AppropriateRepo<Key extends keyof Database> = 'instruments' extends Key
    ? InstrumentsRepositoryClass
    : 'users' extends Key
    ? UsersRepositoryClass
    : Repository<Key>;

/**
 * Pretty much @ts-ignore on the whole object...
 * Static typing is nice I guess :)
 */
const repositoryCache = new (class extends Map<keyof Database, Repository<any>> {
    #recipes = {
        instruments: () => new InstrumentsRepositoryClass(db, logger),
        users: () => new UsersRepositoryClass(db),
    } as const;

    #init<K extends keyof Database>(key: K): void {
        if (!this.has(key)) {
            let newRepository: Repository<K>;
            if (key in this.#recipes) {
                // @ts-ignore I don't understand why this doesn't want to work
                newRepository = this.#recipes[key]();
            } else {
                newRepository = new Repository(db, key);
            }

            this.set(key, newRepository);
        }
    }

    // @ts-ignore
    get<K extends keyof Database>(key: K): AppropriateRepo<K> {
        this.#init(key);

        // @ts-ignore trust me, bro
        return super.get(key);
    }
})();

/**
 * Lazy creation of repository objects
 */
export default function getRepositoryFor<K extends keyof Database>(entity: K): AppropriateRepo<K> {
    return repositoryCache.get(entity);
}

/** @deprecated **/
export const UsersRepository = new Repository(db, 'users');

export function query(): Kysely<Database> {
    return db;
}
