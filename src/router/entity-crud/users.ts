import { TRPCError } from '@trpc/server';
import { RawBuilder } from 'kysely';
import { z } from 'zod';
import { ArgonUtil } from '@/lib/auth/crypto';
import { UsersValidator } from '@/lib/entity-utils/validators';
import { Pageable, Pager } from '@/lib/pager';
import getRepositoryFor, { UsersRepository } from '@/lib/repositories';
import { createServerError } from '@/lib/trcp/errors';
import { AdminAuthorized, Authenticated, Authorized, Router } from '@/lib/trcp/server';
import Users from '@/model/user';
import type { Role } from '@/model/user';

const fetchAll = AdminAuthorized.input(Pager.input).query(async function ({ input }) {
    const users = getRepositoryFor('users');

    const qb = await users.paged(input);
    const objects = await qb.queryBuilder.selectAll().execute();

    return {
        maxPage: qb.maxPage,
        payload: objects,
    } satisfies Pageable<(typeof objects)[0]>;
});

const one = AdminAuthorized.input(z.number().int().min(0)).query(async function ({ input }) {
    const users = getRepositoryFor('users');

    return await users.findById(input).executeTakeFirst();
});

const upsert = AdminAuthorized.input(UsersValidator.checkUpsertable).mutation(async function ({
    input,
    ctx,
}) {
    const users = getRepositoryFor('users');

    const { password: rawPassword, roles: roleArray, ...user } = input;

    let password: string | undefined = undefined;
    if (rawPassword) {
        password = await ArgonUtil.hash(rawPassword);
    }

    let roles: RawBuilder<Role[]> | undefined = undefined;
    if (typeof roleArray !== 'undefined') {
        roles = Users.getRolesSQL({ roles: roleArray as Role[] });
    }

    if ('id' in user) {
        const { id, ...userWithoutId } = user;
        return users
            .update()
            .where('users.id', '=', id)
            .set({
                ...userWithoutId,
                password,
                roles,
            })
            .executeTakeFirst();
    }

    return users
        .insert()
        .values({
            ...user,
            password,
            roles,
        })
        .executeTakeFirst();
});

const update = Authenticated.input(z.object({ display_name: z.string().min(5).max(512) })).mutation(
    async function ({ ctx: { user }, input }) {
        const result = await getRepositoryFor('users')
            .update()
            .where('id', '=', user.id)
            .set(input)
            .executeTakeFirst();

        const numUpdated = Number(result.numUpdatedRows);

        if (numUpdated > 1) {
            throw createServerError();
        }

        return numUpdated === 1;
    },
);

const remove = Authorized(['SUPER_ADMIN'])
    .input(z.number().int().min(0))
    .mutation(async function ({ input }) {
        const users = getRepositoryFor('users');

        return await users.remove().where('users.id', '=', input).limit(1).executeTakeFirst();
    });

const me = Authenticated.query(async function ({ ctx }) {
    return await UsersRepository.findById(ctx.user.id).executeTakeFirst();
});

const register = AdminAuthorized.input(
    z.object({
        email: z.string().email(),
        display_name: z.string().min(1),
        password: z.string().min(6),
    }),
).mutation(async function ({ input }) {
    const users = getRepositoryFor('users');

    const exists = await users.one().where('email', '=', input.email).execute();

    if (exists.length !== 0) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Uživatel s e-mailem ${input.email} již existuje.`,
        });
    }

    const insertResult = await users
        .insert()
        .values({
            ...input,
            roles: Users.getRolesSQL({ roles: ['USER'] }),
        })
        .executeTakeFirst();

    if (!insertResult.insertId) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
        });
    }

    return Number(insertResult.insertId);
});

const usersRouter = Router({
    update, // update self
    me,

    fetchAll,
    one,
    upsert,
    remove,

    register,
});

export default usersRouter;
