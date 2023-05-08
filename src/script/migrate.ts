import '../env.mjs';
import { promises as fs } from 'fs';
import * as path from 'path';
import { FileMigrationProvider, type Kysely, type MigrationResultSet, Migrator } from 'kysely';

function printHelp(): void {
    console.log('=============================================');
    console.log('Migrations usage:');
    console.log('    (p)npm migrate {latest|down}');
    console.log('OR: (p)npm migrate to *MIGRATION NAME*');
    console.log('=============================================');
}

async function getDb() {
    // @ts-ignore
    return (await import('../database.ts')).default;
}

async function getMigrator(db: Kysely<any>): Promise<Migrator> {
    const migrationFolder = path.resolve(process.cwd(), 'src/migration');

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
    await db.destroy();
}

async function migrateDown(db: Kysely<any>): Promise<void> {
    console.log('Migrating down one migration.');

    const migrator = await getMigrator(db);
    printResults(await migrator.migrateDown());
    await db.destroy();
}

async function migrateTo(db: Kysely<any>, migrationName: string): Promise<void> {
    console.log(`Migrating down to ${migrationName}.`);

    const migrator = await getMigrator(db);
    printResults(await migrator.migrateTo(migrationName));
    await db.destroy();
}

void (async function () {
    switch (process.argv[2] ?? 'latest') {
        case 'latest':
            await migrateToLatest(await getDb());
            break;

        case 'down':
            await migrateDown(await getDb());
            break;

        case 'to':
            if (typeof process.argv[3] === 'undefined') {
                console.error('You have to supply the name of the migration to migrate to!');
                process.exit(1);
            }
            await migrateTo(await getDb(), process.argv[3]);
            break;
        default:
            console.error('Unknown option!');
            printHelp();
            process.exit(1);
    }
})();
