import env from './src/env.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        const secureHeaders = [
            { key: 'X-FRAME-OPTIONS', value: 'SAMEORIGIN' },
            { key: 'Content-Security-Policy', value: "default-src 'self'; img-src https://*; child-src 'none'" },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
        ];

        if (env.NODE_ENV === 'production') {
            secureHeaders.push({
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubdomains; preload',
            });
        }

        return [
            { source: '/', headers: secureHeaders },
        ];
    },
    poweredByHeader: false,
};

export default nextConfig;
