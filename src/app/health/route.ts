import { sql } from 'kysely';
import type { NextResponse } from 'next/server';
import env from '@/env.mjs';
import response from '@/lib/http/response';
import { query } from '@/lib/repositories';

export type HealthCheckResult<Info = {}> = {
    status: 'healthy' | 'degraded' | 'unhealthy';
    time: number;
} & Info;

function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}

async function tryDatabase(): Promise<
    HealthCheckResult<{ queryResult: any | null; error: Error | null; query: string }>
> {
    let status: HealthCheckResult['status'] = 'unhealthy';
    let result: any | null = null;
    let error: Error | null = null;

    try {
        const { rows } = await sql`SHOW TABLES`.execute(query());
        result = rows;
        status = 'healthy';
    } catch (e: unknown) {
        console.log(e);
        if (!(e instanceof Error)) {
            error = new Error(JSON.stringify(e));
        } else {
            error = e;
        }
    }

    return {
        status,
        time: timestamp(),
        queryResult: result,
        error,
        query: 'SHOW TABLES;',
    };
}

async function handler(): Promise<NextResponse> {
    if (!env.isDevelopment()) {
        return response().status(403).build();
    }

    return response()
        .json({
            database: await tryDatabase(),
        })
        .build();
}

export { handler as GET, handler as POST };
