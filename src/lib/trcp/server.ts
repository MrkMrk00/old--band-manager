import { initTRPC, TRPCError } from '@trpc/server';
import type { TrpcContext } from '@/lib/trcp/context';

const t = initTRPC.context<TrpcContext>().create();

export const Router = t.router;
export const Middleware = t.middleware;
export const Public = t.procedure;

const userAuthMiddleware = Middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            cause: 'Wrong token supplied in X-TOKEN header.',
        });
    }

    return next();
});

export const Authenticated = Public.use(userAuthMiddleware);
