import { Authenticated, Router } from '@/lib/trcp/server';
import { UsersRepository } from '@/lib/repositories';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const update = Authenticated.input(z.object({ display_name: z.string() })).mutation(
    async ({ ctx, input }) => {
        const user = ctx.user!;

        const result = await UsersRepository.update(user.id).set(input).execute();

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
    },
);

const me = Authenticated.query(async ({ ctx }) => await UsersRepository.findById(ctx.user.id));

const usersRouter = Router({
    update,
    me,
});

export default usersRouter;
