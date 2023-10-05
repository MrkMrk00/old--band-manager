import { TRPCError } from '@trpc/server';
import { RawBuilder } from 'kysely';
import { z } from 'zod';
import { ArgonUtil } from '@/lib/auth/crypto';
import { UsersValidator } from '@/lib/entity-utils/validators';
import { Pageable, Pager } from '@/lib/pager';
import getRepositoryFor, { UsersRepository } from '@/lib/repositories';
import { AdminAuthorized, Authenticated, Authorized, Router } from '@/lib/trcp/server';
import Users from '@/model/user';
import type { Role } from '@/model/user';

const fetchAll = AdminAuthorized.input(Pager.input).query(async function ({ ctx, input }) {
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
            .updateQb()
            .where('u.id', '=', id)
            .set({
                ...userWithoutId,
                password,
                roles,
            })
            .executeTakeFirst();
    }

    return users
        .insertQb()
        .values({
            ...user,
            password,
            roles,
        })
        .executeTakeFirst();
});

const update = Authenticated.input(z.object({ display_name: z.string().min(5).max(512) })).mutation(
    async function ({ ctx: { user }, input }) {
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

const remove = Authorized(['SUPER_ADMIN'])
    .input(z.number().int().min(0))
    .mutation(async function ({ input }) {
        const users = getRepositoryFor('users');

        return await users.deleteQb().where('u.id', '=', input).limit(1).executeTakeFirst();
    });

const me = Authenticated.query(async function ({ ctx }) {
    return await UsersRepository.findById(ctx.user.id).executeTakeFirst();
});

const usersRouter = Router({
    update, // update self
    me,

    fetchAll,
    one,
    upsert,
    remove,
});

export default usersRouter;
