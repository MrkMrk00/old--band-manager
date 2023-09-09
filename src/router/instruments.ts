import type {
    InstrumentGrouping,
    NewInstrumentGrouping,
    UpdatableGrouping,
} from '@/model/instrument_groupings';
import { Authenticated, Router } from '@/lib/trcp/server';
import { InstrumentsRepository, query, UsersRepository } from '@/lib/repositories';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { type Pageable, Pager } from '@/lib/pager';
import { sql } from 'kysely';
import { countAll } from '@/lib/specs';

const fetchAll = Authenticated.input(Pager.input).query(async function ({ input }) {
    const { perPage, page } = input;
    const allCount = await countAll('instruments');
    const { maxPage, offset } = Pager.query(allCount, perPage, page);

    const pagedInstruments = await query()
        .selectFrom('instruments')
        .selectAll()
        .limit(perPage)
        .offset(offset)
        .execute();

    const allGroupings = await query().selectFrom('instrument_groupings').selectAll().execute();

    const groupingsById = new Map<number, (typeof allGroupings)[0]>();
    for (const grouping of allGroupings) {
        groupingsById.set(grouping.id, grouping);
    }

    type ResultInstrumentType = Omit<(typeof pagedInstruments)[0], 'groupings'> & {
        groupings: (typeof allGroupings)[0][];
    };

    const instruments = new Array<ResultInstrumentType>(pagedInstruments.length);

    let at = 0;
    for (let instrument of pagedInstruments) {
        instruments[at] = {
            ...instrument,
            groupings: instrument.groupings.map(id => groupingsById.get(id)!),
        };

        at++;
    }

    return {
        maxPage,
        payload: instruments,
    } satisfies Pageable<(typeof instruments)[0]>;
});

const upsert = Authenticated.input(
    z.object({
        id: z.number().int().min(0).optional(),
        name: z.string().min(1).max(512),
        subname: z
            .string()
            .max(512)
            .optional()
            .transform(s => (!s ? undefined : s)),
        icon: z
            .string()
            .optional()
            .transform(s => (!s || !z.string().url().parse(s) ? undefined : s)),
        groupings: z.array(z.number().int().min(0)).optional(),
    }),
).mutation(async ({ ctx, input }) => {
    if (typeof input.id === 'undefined') {
        const qb = InstrumentsRepository.insertQb().values({
            name: input.name,
            subname: input.subname,
            icon: input.icon,
            created_by: ctx.user.id,
            groupings: sql`'[]'`,
        });

        const result = await qb.executeTakeFirst();

        return Number(result.insertId);
    }

    const result = await InstrumentsRepository.updateQb({ id: input.id })
        .set({
            name: input.name,
            subname: input.subname,
            icon: input.icon,
            groupings: input.groupings ? sql`${JSON.stringify(input.groupings)}` : sql`'[]'`,
        })
        .executeTakeFirst();

    if (Number(result.numUpdatedRows) > 1) {
        throw new TRPCError({
            message: 'Kurva, zas to updatuje jinak než má',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }

    return true;
});

const deleteOne = Authenticated.input(z.number().int()).mutation(async ({ input }) => {
    const result = await InstrumentsRepository.delete(input).execute();

    if (result.length !== 1) {
        throw new TRPCError({
            message: 'Nevim',
            code: 'BAD_REQUEST',
        });
    }

    if (Number(result[0].numDeletedRows) > 1) {
        throw new TRPCError({
            message: 'Kurva, moc toho mažeš',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }

    return true;
});

const one = Authenticated.input(z.number().int().min(0)).query(async function ({ input }) {
    let res = await InstrumentsRepository.findById(input).executeTakeFirst();

    if (!res) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tenhle nástroj neexistuje.',
        });
    }

    const user = await UsersRepository.findById(res?.created_by).executeTakeFirst();

    let groupings: InstrumentGrouping[];
    if (res.groupings.length > 0) {
        groupings = await query()
            .selectFrom('instrument_groupings')
            .selectAll()
            .where('id', 'in', res.groupings)
            .execute();
    } else {
        groupings = [];
    }

    return {
        ...res,
        user: user,
        groupings: groupings,
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
        .leftJoin('users', j => j.onRef('instrument_groupings.created_by', '=', 'users.id'))
        .select([
            'instrument_groupings.id',
            'instrument_groupings.name',
            'instrument_groupings.created_by',
            'instrument_groupings.created_at',
            'instrument_groupings.updated_at',
            'users.display_name as admin_name',
        ])
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

const grouping_upsert = Authenticated.input(
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

const grouping_delete = Authenticated.input(z.number().int().min(0)).mutation(async function ({
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
