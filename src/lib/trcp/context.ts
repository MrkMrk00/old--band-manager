import type { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/src/adapters/fetch/types';
import { SessionReader } from '@/lib/auth/session';

export async function createContext({ req }: FetchCreateContextFnOptions) {
    const reader = await SessionReader.fromRequest(req);

    if (!reader.isValid) {
        return {};
    }

    return {
        user: reader.session,
    };
}

export type TrpcContext = inferAsyncReturnType<typeof createContext>;
