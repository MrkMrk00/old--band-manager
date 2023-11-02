import groupingsRouter from './instrument-groupings';
import Logger from '@/lib/logger';
import { type Pageable, Pager } from '@/lib/pager';
import getRepositoryFor from '@/lib/repositories';
import { countAll } from '@/lib/specs';
import { createNotFound } from '@/lib/trcp/errors';
import { AdminAuthorized, Authenticated, Router } from '@/lib/trcp/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

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

    const result = await instruments.remove().where('id', '=', input).executeTakeFirst();

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
        .select()
        .selectAll('instruments')
        .leftJoin('users as u', j => j.onRef('u.id', '=', 'instruments.created_by'))
        .select('u.display_name as user')
        .where('instruments.id', '=', input)
        .executeTakeFirst();

    if (!instrument) {
        throw createNotFound('instrument');
    }

    const groupings = await instruments.getRelatedGroupings(instrument.id).execute();

    return {
        ...instrument,
        groupings,
    };
});

export default Router({
    fetchAll,
    upsert,
    delete: deleteOne,
    one,

    groupings: groupingsRouter,
});
