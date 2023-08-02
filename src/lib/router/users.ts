import { Authenticated, Router } from '@/lib/trcp/server';
import { UsersRepository } from '@/lib/repositories';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const update = Authenticated.input(z.object({ display_name: z.string().min(5).max(512) })).mutation(
    async ({ ctx: { user }, input }) => {
        const result = await UsersRepository.updateQb(user.id).set(input).execute();

        const numUpdated = Number(result[0]?.numUpdatedRows);

        if (numUpdated > 1) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Piče, updatuješ toho víc než chceš',
            });
        }

        return numUpdated === 1;
    },
);

const me = Authenticated.query(async function ({ ctx }) {
    return await UsersRepository.findById(ctx.user.id).executeTakeFirst();
});

const usersRouter = Router({
    update,
    me,
});

export default usersRouter;
