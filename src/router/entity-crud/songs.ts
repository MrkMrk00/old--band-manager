import { Pageable, Pager } from '@/lib/pager';
import getRepositoryFor from '@/lib/repositories';
import { createNotFound, createServerError, createUnauthorized } from '@/lib/trcp/errors';
import { AdminAuthorized, Authenticated, Router } from '@/lib/trcp/server';
import Users, { wrapUser } from '@/model/user';
import { z } from 'zod';

const fetchAll = Authenticated.input(Pager.input).query(async function ({ input }) {
    const songs = getRepositoryFor('songs');

    const { maxPage, queryBuilder } = await songs.paged(input);
    const payload = await queryBuilder.selectAll().execute();

    return {
        maxPage,
        payload,
    } satisfies Pageable<(typeof payload)[0]>;
});

const one = Authenticated.input(z.number().int().min(0)).query(async function ({ input }) {
    const songs = getRepositoryFor('songs');
    const song = await songs.findById(input).executeTakeFirst();

    if (!song) {
        throw createNotFound('song');
    }

    return song;
});

const songInsertable = z.object({
    number: z.string().max(63).min(1),
    name: z.string().max(255).min(1),
    composer: z.string().max(255).optional(),
    arranger: z.string().max(255).optional(),
    link: z.string().max(1023).optional(),
    custom_data: z.record(z.any()).optional(),
});

const checkUpsertable = z
    .object({
        id: z.number().int().min(0),
    })
    .merge(songInsertable.partial())
    .or(songInsertable);

const upsert = AdminAuthorized.input(checkUpsertable).mutation(async function ({ input, ctx }) {
    const songs = getRepositoryFor('songs');
    if ('id' in input) {
        const { id, ...song } = input;
        const result = await songs.update().set(song).where('id', '=', input.id).executeTakeFirst();

        if (Number(result.numUpdatedRows) > 1) {
            throw createServerError('moreChangedThanExpected', true, 'ucfirst', 'a:!');
        }

        return id;
    }

    const result = await songs
        .insert()
        .values({
            ...input,
            created_by: ctx.user.id,
        })
        .executeTakeFirst();

    if (Number(result.numInsertedOrUpdatedRows) === 1) {
        return Number(result.insertId);
    }

    throw createServerError();
});

const remove = Authenticated.input(z.number().int().min(0)).mutation(async function ({
    input,
    ctx,
}) {
    const songs = getRepositoryFor('songs');
    const existingSong = await songs.findById(input).executeTakeFirst();

    if (!existingSong) {
        throw createNotFound('song');
    }

    const user = wrapUser((await Users.fetchFull(ctx.user))!);

    if (!user.hasRole(['ADMIN', 'SUPER_ADMIN']) || user.id !== existingSong.created_by) {
        throw createUnauthorized();
    }

    const result = await songs.remove(existingSong.id).executeTakeFirst();
    if (Number(result.numDeletedRows) > 1) {
        throw createServerError();
    }

    return true;
});

export default Router({
    fetchAll,
    one,
    upsert,
    remove,
});
