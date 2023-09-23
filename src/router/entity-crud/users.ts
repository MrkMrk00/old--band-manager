import { TRPCError } from '@trpc/server';
import { sql } from 'kysely';
import { z } from 'zod';
import { Pageable, Pager } from '@/lib/pager';
import { UsersRepository } from '@/lib/repositories';
import { Authenticated, Router } from '@/lib/trcp/server';

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

const fetchAll = Authenticated.input(Pager.input).query(async function ({ ctx, input }) {
    const allCount =
        (
            await UsersRepository.selectQb()
                .select(sql<number>`COUNT(*)`.as('count'))
                .executeTakeFirst()
        )?.count ?? 0;

    const { maxPage, queryBuilder } = Pager.handleQuery(
        UsersRepository.all(),
        allCount,
        input.perPage,
        input.page,
    );

    const result = await queryBuilder.execute();

    return {
        maxPage,
        payload: result,
    } satisfies Pageable<(typeof result)[0]>;
});

const usersRouter = Router({
    update, // update self
    me,
    fetchAll,
});

export default usersRouter;
