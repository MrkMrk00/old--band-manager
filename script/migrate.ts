// @ts-ignore
import loadEnv from './loadEnv.ts';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
    FileMigrationProvider,
    type Kysely,
    type MigrationResultSet,
    Migrator,
    NO_MIGRATIONS,
    NoMigrations,
} from 'kysely';

function printHelp(): void {
    console.log('=============================================');
    console.log('Migrations usage:');
    console.log('    (p)npm migrate {latest}    Migrates to current version.');
    console.log('    (p)npm migrate down        Goes back one migration.');
    console.log('    (p)npm migrate to_none     Calls down on all migrations - deletes everything.');
    console.log('    (p)npm migrate force       Deletes everything and migrates to latest.');
    console.log('    (p)npm migrate to *MIGRATION NAME*');
    console.log('=============================================');
}

async function getDb() {
    // @ts-ignore
    return (await import('../src/database.ts')).default;
}

async function getMigrator(db: Kysely<any>): Promise<Migrator> {
    const migrationFolder = path.resolve(process.cwd(), 'migration');

    return new Migrator({
        db,
        provider: new FileMigrationProvider({ fs, path, migrationFolder }),
    });
}

function printResults({ error, results }: MigrationResultSet): void {
    if (error || !results) {
        console.error('Failed to migrate', error);
        process.exit(1);
    }

    if (results.length < 1) {
        console.log('No migrations executed.');
        return;
    }

    for (const { status, migrationName } of results) {
        const print = status === 'Success' ? console.log : console.error;

        print(`${status}: ${migrationName}`);
    }
}

async function migrateToLatest(db: Kysely<any>): Promise<void> {
    console.log('Migrating to latest.');

    const migrator = await getMigrator(db);
    printResults(await migrator.migrateToLatest());
}

async function migrateDown(db: Kysely<any>): Promise<void> {
    console.log('Migrating down one migration.');

    const migrator = await getMigrator(db);
    printResults(await migrator.migrateDown());
}

async function migrateTo(db: Kysely<any>, migrationName: string | NoMigrations): Promise<void> {
    console.log(`Migrating down to ${migrationName}.`);

    const migrator = await getMigrator(db);
    printResults(await migrator.migrateTo(migrationName));
}

void (async function () {
    await loadEnv();
    const db = await getDb();

    switch (process.argv[2] ?? 'latest') {
        case 'latest':
            await migrateToLatest(db);
            break;

        case 'down':
            await migrateDown(db);
            break;

        case 'to':
            if (typeof process.argv[3] === 'undefined') {
                console.error('You have to supply the name of the migration to migrate to!');
                await db.destroy();
                process.exit(1);
            }
            await migrateTo(db, process.argv[3]);
            break;

        case 'to_none':
            await migrateTo(db, NO_MIGRATIONS);
            break;

        case 'force':
            await migrateTo(db, NO_MIGRATIONS);
            await migrateToLatest(db);
            break;

        default:
            console.error('Unknown option!');
            printHelp();
            await db.destroy();
            process.exit(1);
    }

    await db.destroy();
})();
