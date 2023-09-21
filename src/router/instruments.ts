import type { NewInstrumentGrouping, UpdatableGrouping } from '@/model/instrument_groupings';
import {AdminAuthorized, Authenticated, Router} from '@/lib/trcp/server';
import getRepositoryFor, { query } from '@/lib/repositories';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { type Pageable, Pager } from '@/lib/pager';
import { sql } from 'kysely';
import { countAll } from '@/lib/specs';
import Logger from '@/lib/logger';

const fetchAll = Authenticated.input(Pager.input).query(async function ({ input }) {
    const { perPage, page } = input;
    const allCount = await countAll('instruments');
    const { maxPage, offset } = Pager.query(allCount, perPage, page);

    const instruments = getRepositoryFor('instruments');

    const pagedInstruments = await instruments.selectAll().limit(perPage).offset(offset).execute();

    const relatedGroupings = await instruments
        .getRelatedGroupings(pagedInstruments.map(i => i.id))
        .execute();

    type ResultInstrumentType = Omit<(typeof pagedInstruments)[0], 'groupings'> & {
        groupings: (typeof relatedGroupings)[0][];
    };

    const objects = new Array<ResultInstrumentType>(pagedInstruments.length);

    let at = 0;
    for (let instrument of pagedInstruments) {
        const groupings = relatedGroupings.filter(
            grouping => grouping.id_instrument === instrument.id,
        );
        objects[at] = {
            ...instrument,
            groupings,
        };

        at++;
    }

    return {
        maxPage,
        payload: objects,
    } satisfies Pageable<(typeof objects)[0]>;
});

const instrumentIsUpsertable = z.object({
    id: z.number().int().min(0).optional(),
    name: z.string().max(511),
    subname: z.string().max(511).optional(),
    icon: z.string().url().optional(),
    groupings: z.array(z.number().int()).optional(),
});

const upsert = AdminAuthorized.input(instrumentIsUpsertable).mutation(async ({ input, ctx }) => {
    const instruments = getRepositoryFor('instruments');

    const upsertResult = await instruments.upsert({ ...input, created_by: ctx.user.id });
    if (upsertResult instanceof z.ZodError) {
        const { message, cause } = upsertResult;

        throw new TRPCError({
            code: 'BAD_REQUEST',
            message,
            cause,
        });
    }

    const rowNum =
        'insertId' in upsertResult
            ? upsertResult.numInsertedOrUpdatedRows
            : upsertResult.numUpdatedRows;
    if (typeof rowNum === 'undefined' || Number(rowNum) !== 1) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'No rows updated!',
        });
    }

    let id: number;
    if ('insertId' in upsertResult) {
        id = Number(upsertResult.insertId);
    } else {
        if (typeof input.id === 'undefined') {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'No ID to return found',
            });
        }

        id = input.id;
    }

    return id;
});

const deleteOne = AdminAuthorized.input(z.number().int().min(0)).mutation(async ({ input }) => {
    const instruments = getRepositoryFor('instruments');

    const result = await instruments.deleteQb(input).executeTakeFirst();

    if (Number(result.numDeletedRows) > 1) {
        const logger = Logger.fromEnv();

        logger.error('InstrumentsTRPCRouter.deleteOne :: HODNĚ ŠPATNÝ, MAŽE SE TOHO MOC', {
            id: input,
            numDeletedRows: Number(result.numDeletedRows),
        });

        throw new TRPCError({
            message: 'HODNĚ ŠPATNÝ, MAŽE SE TOHO MOC',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }

    return true;
});

const one = Authenticated.input(z.number().int().min(0)).query(async function ({ input }) {
    const instruments = getRepositoryFor('instruments');

    const instrument = await instruments
        .selectQb()
        .selectAll('i')
        .leftJoin('users as u', j => j.onRef('u.id', '=', 'i.created_by'))
        .select('u.display_name as user')
        .where('i.id', '=', input)
        .executeTakeFirst();

    if (!instrument) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tenhle nástroj neexistuje.',
        });
    }

    const groupings = await instruments.getRelatedGroupings(instrument.id).execute();

    return {
        ...instrument,
        groupings,
    };
});

// ================================================================================================
// =====================================Instrument Groupings=======================================
// ================================================================================================

const grouping_fetchAll = Authenticated.input(
    z
        .object({
            ids: z.array(z.number()).optional(),
        })
        .merge(Pager.input),
).query(async function ({ input }) {
    let countQb = query()
        .selectFrom('instrument_groupings')
        .select(sql<number>`COUNT(*)`.as('count'));

    if (input.ids) {
        countQb = countQb.where('id', 'in', input.ids);
    }

    let allCount = (await countQb.executeTakeFirst())?.count;

    if (typeof allCount === 'undefined') {
        return {
            maxPage: 0,
            page: 1,
            payload: [],
        };
    }

    let objectsQb = query()
        .selectFrom('instrument_groupings')
        .selectAll()
        .leftJoin('users', j => j.onRef('instrument_groupings.created_by', '=', 'users.id'))
        .select('users.display_name as admin_name')
        .orderBy('instrument_groupings.name');

    const result = Pager.handleQuery(objectsQb, allCount, input.perPage, input.page);

    const objects = await result.queryBuilder.execute();

    return {
        maxPage: result.maxPage,
        payload: objects,
    } satisfies Pageable<(typeof objects)[0]>;
});

const grouping_one = Authenticated.input(z.number().int().min(0)).query(async function ({ input }) {
    return await query()
        .selectFrom('instrument_groupings')
        .selectAll()
        .where('id', '=', input)
        .executeTakeFirstOrThrow();
});

async function insertGrouping(grouping: NewInstrumentGrouping) {
    const insertRes = await query()
        .insertInto('instrument_groupings')
        .values(grouping)
        .executeTakeFirst();

    if (Number(insertRes.numInsertedOrUpdatedRows) === 1) {
        return Number(insertRes.insertId);
    }

    throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Hupsík dupsík, něco se posralo. Nevložil se novej instrument_grouping.',
    });
}

async function updateGrouping(id: number, grouping: UpdatableGrouping) {
    const res = await query()
        .updateTable('instrument_groupings')
        .where('id', '=', id)
        .set(grouping)
        .executeTakeFirst();

    if (Number(res.numUpdatedRows) > 1) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Je to v piči, updatuje se toho víc, než by mělo.',
        });
    }

    return true;
}

const grouping_upsert = AdminAuthorized.input(
    z.object({
        id: z.number().int().min(0).optional(),
        name: z.string().min(1).max(255),
    }),
).mutation(async function ({ input, ctx }) {
    if (typeof input.id !== 'undefined') {
        return await updateGrouping(input.id, { name: input.name });
    }

    return await insertGrouping({
        ...input,
        created_by: ctx.user.id,
    });
});

const grouping_delete = AdminAuthorized.input(z.number().int().min(0)).mutation(async function ({
    input,
}) {
    const res = await query()
        .deleteFrom('instrument_groupings')
        .where('id', '=', input)
        .executeTakeFirst();

    if (Number(res.numDeletedRows) > 1) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Piče, maže ti to toho víc, než by mělo!',
        });
    }

    return true;
});

const groupingsRouter = Router({
    fetchAll: grouping_fetchAll,
    one: grouping_one,
    upsert: grouping_upsert,
    delete: grouping_delete,
});

// ================================================================================================
// ==========================================Root router===========================================
// ================================================================================================

export default Router({
    fetchAll,
    upsert,
    delete: deleteOne,
    one,

    groupings: groupingsRouter,
});
