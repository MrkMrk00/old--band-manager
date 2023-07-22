import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const _env = createEnv({
    server: {
        NODE_ENV: z.enum(['production', 'test', 'development']),
        DB_CONN: z.string().url(),
        DOMAIN: z.string().url().endsWith('/'),
        FB_APP_ID: z.string().regex(/\d+/),
        FB_APP_SECRET: z.string(),
        APP_SECRET: z.string(),
    },
    client: {
        NEXT_PUBLIC_FB_APP_ID: z.string().regex(/\d+/),
        NEXT_PUBLIC_DOMAIN: z.string().url().endsWith('/'),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        DB_CONN: process.env.DB_CONN,
        DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
        FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
        FB_APP_SECRET: process.env.FB_APP_SECRET,
        APP_SECRET: process.env.APP_SECRET,

        NEXT_PUBLIC_FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
        NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.NEXT_PUBLIC_DOMAIN,
    },
});

export default _env;
