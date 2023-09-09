import path from 'node:path';
import fs from 'node:fs';

/**
 * @param longOpt {string}
 * @param shortOpt {string|undefined}
 * @returns {boolean}
 */
function hasBoolOpt(longOpt, shortOpt = undefined) {
    longOpt = longOpt.replaceAll('-', '').toLowerCase();

    if (!shortOpt) {
        shortOpt = longOpt.at(0);
    }

    return process.argv.some(o => o === `--${longOpt}` || o === `-${shortOpt}`);
}

function getLastMigrationNumber() {
    let highest = 0;
    for (const f of fs.readdirSync('./migration')) {
        const current = +f.replaceAll(/[a-zA-Z]|\.|_/g, '');
        if (current > highest) {
            highest = current;
        }
    }

    return highest;
}

if (process.argv.length < 3) {
    console.error('Provide table name');
    process.exit(1);
}


const migrationName = process.argv[2];
const sameNum = hasBoolOpt('same');
const highest = getLastMigrationNumber();

const number = String(sameNum ? highest : highest + 1).padStart(4, '0');
const fileName = `${number}_${migrationName}.ts`;

const template = fs.readFileSync(path.join(process.cwd(), './script/_migration_template.ts'), { encoding: 'utf-8' })
    .toString()
    .replaceAll('{{TABLE_NAME}}', migrationName);

const handle = fs.openSync(`./migration/${fileName}`, 'w');

fs.writeSync(handle, new TextEncoder().encode(template));

fs.closeSync(handle);

