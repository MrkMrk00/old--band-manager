import fs from 'node:fs';
import * as path from 'node:path';
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from 'zod';
import dotenv from 'dotenv';

const baseEnvPath = path.resolve(process.cwd(), '.env');

if (!process.env.APP_ENV) {
    dotenv.config({ path: baseEnvPath });
    dotenv.config({ path: baseEnvPath + '.local' });
}

if (process.env.APP_ENV) {
    for (const profile of process.env.APP_ENV.split(',')) {
        const envPath = path.resolve(process.cwd(), `.env.${profile}`);

        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath, override: true });
        }
    }
}

const _env = createEnv({
    /*
     * Specify what prefix the client-side variables must have.
     * This is enforced both on type-level and at runtime.
     */
    clientPrefix: "PUBLIC_",
    server: {
        APP_ENV: z.enum(['dev', 'prod']),
        DB_HOST: z.string(),
        DB_USER: z.string(),
        DB_PASSWD: z.string(),
        DB_NAME: z.string(),
    },
    client: {},
    runtimeEnv: {
        APP_ENV: process.env.APP_ENV,
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWD: process.env.DB_PASSWD,
        DB_NAME: process.env.DB_NAME,
    },
});

_env.isDevelopment = function() {
    return this.APP_ENV === 'dev';
};

_env.isProduction = function() {
    return this.APP_ENV === 'prod';
}

export default _env;