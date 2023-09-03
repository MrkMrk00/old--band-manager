import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const _env = createEnv({
    server: {
        NODE_ENV: z.enum(['production', 'test', 'development']),
        DB_CONN: z.string().url(),
        DOMAIN: z.string().url().endsWith('/'),
        APP_SECRET: z.string(),

        FB_APP_ID: z.string().regex(/\d+/).nullable(),
        FB_APP_SECRET: z.string().nullable(),
    },
    client: {
        NEXT_PUBLIC_FB_APP_ID: z.string().regex(/\d+/).nullable(),
        NEXT_PUBLIC_DOMAIN: z.string().url().endsWith('/'),
        NEXT_PUBLIC_ENV: z.enum(['production', 'test', 'development']),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV ?? 'production',
        DB_CONN: process.env.DB_CONN,
        DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
        FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
        FB_APP_SECRET: process.env.FB_APP_SECRET ?? null,
        APP_SECRET: process.env.APP_SECRET,

        NEXT_PUBLIC_FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
        NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.NEXT_PUBLIC_DOMAIN,
        NEXT_PUBLIC_ENV: process.env.NODE_ENV ?? 'production',
    },
});

export default _env;
