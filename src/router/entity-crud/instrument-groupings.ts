import { z } from 'zod';
import { Pageable, Pager } from '@/lib/pager';
import getRepositoryFor from '@/lib/repositories';
import { countAll } from '@/lib/specs';
import { AdminAuthorized, Authenticated, Router } from '@/lib/trcp/server';
import { createNotFound, createServerError } from '@/router/errors';

const fetchAll = Authenticated.input(
    z.object({ ids: z.array(z.number()).optional() }).merge(Pager.input),
).query(async function ({ input }) {
    const groupings = getRepositoryFor('instrument_groupings');
    const allCount = await countAll('instrument_groupings');

    const { offset, maxPage } = Pager.query(allCount, input.perPage, input.page);

    const qb = groupings
        .all(offset, input.perPage)
        .leftJoin('users as u', 'u.id', 'instrument_groupings.created_by')
        .select('u.display_name as admin_name')
        .orderBy('instrument_groupings.name');

    const objects = await qb.execute();

    return {
        maxPage,
        payload: objects,
    } satisfies Pageable<(typeof objects)[0]>;
});

const one = Authenticated.input(z.number().int().min(0)).query(async function ({ input }) {
    const grouping = await getRepositoryFor('instrument_groupings')
        .findById(input)
        .executeTakeFirst();
    if (!grouping) {
        throw await createNotFound('instrument_groupings');
    }

    return grouping;
});

const checkUpsertable = z.object({
    id: z.number().int().min(0).optional(),
    name: z.string().min(1).max(255),
    custom_data: z.record(z.any()).optional(),
});

const upsert = AdminAuthorized.input(checkUpsertable).mutation(async function ({ input, ctx }) {
    const groupings = getRepositoryFor('instrument_groupings');

    const { id, ...grouping } = input;

    if (id) {
        const result = await groupings
            .updateQb()
            .set(grouping)
            .where('instrument_groupings.id', '=', id)
            .executeTakeFirst();

        if (Number(result.numUpdatedRows) > 1) {
            throw await createServerError('moreChangedThanExpected', true, 'ucfirst', 'a:!');
        }

        return id;
    }

    const result = await groupings
        .insertQb()
        .values({
            ...grouping,
            created_by: ctx.user.id,
        })
        .executeTakeFirst();

    if (Number(result.numInsertedOrUpdatedRows) !== 1) {
        throw await createServerError();
    }

    return Number(result.insertId);
});

const remove = AdminAuthorized.input(z.number().int().min(0)).mutation(async function ({ input }) {
    const groupings = getRepositoryFor('instrument_groupings');

    const result = await groupings.deleteQb().where('id', '=', input).executeTakeFirst();

    if (Number(result.numDeletedRows) > 1) {
        throw await createServerError('moreChangedThanExpected', true, 'ucfirst', 'a:!');
    }

    return true;
});

const groupingsRouter = Router({
    fetchAll,
    one,
    upsert,
    delete: remove,
});

export default groupingsRouter;
