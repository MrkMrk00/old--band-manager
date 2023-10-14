import { Kysely, sql } from 'kysely';
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

const repositoryRecipes: { [key in keyof Database]?: () => Repository<key> } = {
    instruments: () => new InstrumentsRepositoryClass(db, logger),
    users: () => new UsersRepositoryClass(db),
} as const;

const repositoryCache = new (class extends Map<keyof Database, Repository<any>> {
    get<K extends keyof Database>(key: K): AppropriateRepo<K> {
        let repository = super.get(key);

        if (!repository) {
            if (key in repositoryRecipes) {
                repository = repositoryRecipes[key]!();
            } else {
                repository = new Repository(db, key);
            }

            this.set(key, repository);
        }

        return repository as AppropriateRepo<K>;
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

export function sqlQuery(sqlTpl: ReturnType<typeof sql>) {
    return sqlTpl.execute(db);
}
