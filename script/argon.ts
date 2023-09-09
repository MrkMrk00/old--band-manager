function importArgon() {
    // @ts-ignore
    return import('../src/lib/auth/crypto.ts');
}

function hasBoolOpt(longOpt: string, shortOpt: string|undefined = undefined) {
    longOpt = longOpt.replaceAll('-', '').toLowerCase();

    if (!shortOpt) {
        shortOpt = longOpt.at(0);
    }

    return process.argv.some(o => o === `--${longOpt}` || o === `-${shortOpt}`);
}

function getOptOpt() {
    let last = 0;
    for (const arg of process.argv) {
        if (arg === '--hash' || arg === '--verify') {
            break;
        }

        last++;
    }

    return last;
}

if (hasBoolOpt('--hash')) {
    const last = getOptOpt();

    if (process.argv.length <= last + 1) {
        throw new Error('Provide password');
    }

    const password = process.argv[last + 1];

    importArgon().then(imp => {
        imp.ArgonUtil.hash(password).then(console.log);
    });
}

if (hasBoolOpt('--verify')) {
    const last = getOptOpt();

    if (process.argv.length <= last + 2) {
        throw new Error('Provide password and hash.');
    }

    const plaintext = process.argv[last + 1];
    const hash = process.argv[last + 2];
    importArgon().then(imp => {
        imp.ArgonUtil.verify(plaintext, hash).then(console.log);
    })
}