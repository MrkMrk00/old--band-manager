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
        FB_VAPI: z.string().regex(/\d{2}\.\d/),
    },
    client: {
        NEXT_PUBLIC_FB_APP_ID: z.string().regex(/\d+/).nullable(),
        NEXT_PUBLIC_FB_VAPI: z.string().regex(/\d{2}\.\d/),

        NEXT_PUBLIC_DOMAIN: z.string().url().endsWith('/'),
        NEXT_PUBLIC_ENV: z.enum(['production', 'test', 'development']),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV ?? 'production',
        DB_CONN: process.env.DB_CONN,
        DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
        APP_SECRET: process.env.APP_SECRET,

        FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
        FB_APP_SECRET: process.env.FB_APP_SECRET ?? null,
        FB_VAPI: process.env.NEXT_PUBLIC_FB_VAPI ?? '17.0',

        NEXT_PUBLIC_FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
        NEXT_PUBLIC_FB_VAPI: process.env.NEXT_PUBLIC_FB_VAPI ?? '17.0',

        NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
        NEXT_PUBLIC_ENV: process.env.NODE_ENV ?? 'production',
    },
});

const env = {
    ..._env,

    /**
     * @return {boolean}
     */
    isProduction() {
        if ('NEXT_PUBLIC_ENV' in this) {
            return this.NODE_ENV === 'production';
        }

        return true;
    },

    /**
     * @return {boolean}
     */
    isDevelopment() {
        return !this.isProduction();
    },
};

export default env;
