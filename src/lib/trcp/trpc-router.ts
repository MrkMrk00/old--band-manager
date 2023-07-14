import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '@/lib/trcp/context';

const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;

export const authenticatedProcedure = publicProcedure.use(opts => {
    if (!opts.ctx.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            cause: 'Wrong token supplied in X-TOKEN header.',
        });
    }

    return opts.next();
});

export const appRouter = t.router({
    getUser: publicProcedure.query(opts => {
        return opts.ctx.user;
    }),
});

export type AppRouter = typeof appRouter;
