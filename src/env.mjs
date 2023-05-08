import { createEnv } from "@t3-oss/env-nextjs";
import { z } from 'zod';

const _env = createEnv({
    server: {
        NODE_ENV: z.enum(['production', 'test', 'development']),
        DB_HOST: z.string(),
        DB_USER: z.string(),
        DB_PASSWD: z.string(),
        DB_NAME: z.string(),
        FB_APP_ID: z.string().regex(/\d+/),
        FB_APP_SECRET: z.string(),
    },
    client: {
        NEXT_PUBLIC_FB_APP_ID: z.string().regex(/\d+/),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWD: process.env.DB_PASSWD,
        DB_NAME: process.env.DB_NAME,
        FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
        FB_APP_SECRET: process.env.FB_APP_SECRET,

        NEXT_PUBLIC_FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
    },
});

export default _env;