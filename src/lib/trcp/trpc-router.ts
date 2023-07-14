import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '@/lib/trcp/context';
import { UserRepository } from '@/lib/repositories';
import { z } from 'zod';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
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

const update = authenticatedProcedure
    .input(z.object({ display_name: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const user = ctx.user!;

        const result = await UserRepository.update(user.id).set(input).execute();

        const numUpdated = Number(result[0]?.numUpdatedRows);

        if (numUpdated === 1) {
            return;
        } else if (numUpdated > 1) {
            throw new Error('Je to v piči! Updatuje to víc uživatelů než má!');
        }

        throw new TRPCError({
            code: 'BAD_REQUEST',
            cause: 'no update',
        });
    });

export const appRouter = t.router({
    user: t.router({
        update,
        me: authenticatedProcedure.query(async opts => {
            return await UserRepository.findById(opts.ctx.user!.id);
        }),
    }),
});

export type AppRouter = typeof appRouter;
