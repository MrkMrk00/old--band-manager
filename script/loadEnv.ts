import path from 'node:path';
import dotenv from 'dotenv';

export default async function() {
    if (!process.env.NODE_ENV) {
        // @ts-ignore
        process.env.NODE_ENV = 'development';
    }

    const baseEnvPath = path.resolve(process.cwd(), '.env');
    dotenv.config({ path: baseEnvPath });
    dotenv.config({ path: baseEnvPath + `.${process.env.NODE_ENV}`});
    dotenv.config({ path: baseEnvPath + `.${process.env.NODE_ENV}.local`});
    dotenv.config({ path: baseEnvPath + '.local', override: true });
}