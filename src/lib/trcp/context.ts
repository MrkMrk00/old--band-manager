import { inferAsyncReturnType } from '@trpc/server';
import { decodeJWT, verifyJWT, type Session } from '@/lib/auth/session';
import type { FetchCreateContextFnOptions } from '@trpc/server/src/adapters/fetch/types';

async function handleGetUser(req: FetchCreateContextFnOptions['req']) {
    const token = req.headers.get('X-TOKEN');

    if (!token || !(await verifyJWT(token))) {
        return null;
    }

    const session = decodeJWT(token);
    return session as Session;
}

export async function createContext({ req }: FetchCreateContextFnOptions) {
    const user = await handleGetUser(req);

    return {
        user,
    };
}

export type TrpcContext = inferAsyncReturnType<typeof createContext>;
