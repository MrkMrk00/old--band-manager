import { Authenticated, Router } from '@/lib/trcp/server';
import { InstrumentsRepository, query } from '@/lib/repositories';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { type Pageable, Pager } from '@/lib/pager';
import { sql } from 'kysely';
import { NewInstrumentGrouping, UpdatableGrouping } from '@/model/instrument_groupings';

const fetchAll = Authenticated.input(Pager.input).query(async function ({ input }) {
    let allCount = (
        await InstrumentsRepository.selectQb()
            .select(sql<number>`COUNT(*)`.as('count'))
            .executeTakeFirst()
    )?.count;

    if (!allCount) {
        allCount = 0;
    }

    const { maxPage, offset } = Pager.query(allCount, input.perPage, input.page);

    const result = await InstrumentsRepository.all(offset, input.perPage)
        .orderBy('instruments.name', 'asc')
        .execute();

    return {
        maxPage,
        page: input.page,
        payload: result,
    } satisfies Pageable<(typeof result)[0]>;
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
    }),
).mutation(async ({ ctx, input }) => {
    if (typeof input.id === 'undefined') {
        const result = await InstrumentsRepository.insertQb()
            .values({
                name: input.name,
                subname: input.subname,
                icon: input.icon,
                created_by: ctx.user.id,
            })
            .execute();

        if (result.length !== 1) {
            throw new TRPCError({
                message: 'Failed to insert a new instrument',
                code: 'INTERNAL_SERVER_ERROR',
            });
        }

        return Number(result[0].insertId);
    }

    const result = await InstrumentsRepository.updateQb({ id: input.id })
        .set({
            name: input.name,
            subname: input.subname,
            icon: input.icon,
        })
        .execute();

    if (result.length !== 1) {
        throw new TRPCError({
            message: 'Nevim',
            code: 'BAD_REQUEST',
        });
    }

    if (Number(result[0].numUpdatedRows) > 1) {
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

// ================================================================================================
// =====================================Instrument Groupings=======================================
// ================================================================================================

const grouping_fetchAll = Authenticated.input(Pager.input).query(async function ({ input }) {
    const allCount = await query()
        .selectFrom('instrument_groupings')
        .select(sql<number>`COUNT(*)`.as('count'))
        .executeTakeFirst();

    if (typeof allCount === 'undefined') {
        return {
            maxPage: 0,
            page: 1,
            payload: [],
        };
    }

    const { offset, maxPage } = Pager.query(allCount.count, input.perPage, input.page);

    const objects = await query()
        .selectFrom('instrument_groupings')
        .leftJoin(
            eb => {
                return eb
                    .selectFrom('instruments_instrument_groupings')
                    .select([
                        sql<number>`COUNT(*)`.as('instrument_count'),
                        'id_instrument_grouping',
                    ])
                    .groupBy('id_instrument_grouping')
                    .as('counts');
            },
            on => on.onRef('counts.id_instrument_grouping', '=', 'instrument_groupings.id'),
        )
        .leftJoin('users', j => j.onRef('instrument_groupings.created_by', '=', 'users.id'))
        .select([
            'instrument_groupings.id',
            'instrument_groupings.name',
            'instrument_groupings.created_by',
            'instrument_groupings.created_at',
            'instrument_groupings.updated_at',
            'users.display_name as admin_name',
        ])
        .orderBy('instrument_groupings.name')
        .limit(input.perPage)
        .offset(offset)
        .execute();

    return {
        maxPage: maxPage,
        page: input.page,
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
    one: Authenticated.input(z.number().int().min(0)).query(
        async ({ input }) => await InstrumentsRepository.findById(input),
    ),

    groupings: groupingsRouter,
});
