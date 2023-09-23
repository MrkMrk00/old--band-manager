import { TRPCError, initTRPC } from '@trpc/server';
import getRepositoryFor from '@/lib/repositories';
import type { TrpcContext } from '@/lib/trcp/context';
import type { Role } from '@/model/user';

const t = initTRPC.context<TrpcContext>().create();

export const Router = t.router;
export const Middleware = t.middleware;
export const Public = t.procedure;

export const Authenticated = Public.use(function ({ ctx, next }) {
    if (!ctx.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
        });
    }

    return next({
        ctx,
    });
});

const roleMiddlewareCache: Map<string, typeof Authenticated> = new Map();

function createUnauthorizedError(): TRPCError {
    return new TRPCError({
        code: 'UNAUTHORIZED',
        message: "You don't have access to this resource!",
    });
}

function createAuthorizedProcedure(roles: Role[], query: 'any' | 'all' = 'any') {
    return Authenticated.use(async function ({ ctx, next }) {
        const userRolesResult = await getRepositoryFor('users')
            .selectQb()
            .select('users.roles')
            .where('users.id', '=', ctx.user.id)
            .executeTakeFirst();

        if (!userRolesResult || userRolesResult.roles.length < 1) {
            return next();
        }

        const userRoles = userRolesResult.roles;

        switch (query) {
            case 'all': {
                if (roles.every(r => userRoles.includes(r))) {
                    return next();
                }

                throw createUnauthorizedError();
            }

            case 'any': {
                if (roles.some(r => userRoles.includes(r))) {
                    return next();
                }

                throw createUnauthorizedError();
            }

            default:
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
        }
    });
}

export function Authorized(roles: Role[], query: 'any' | 'all' = 'any'): typeof Authenticated {
    const cacheKey = roles.filter(Boolean).join(',');
    let procedureBuilder = roleMiddlewareCache.get(cacheKey);

    if (!procedureBuilder) {
        procedureBuilder = createAuthorizedProcedure(roles, query);
        roleMiddlewareCache.set(cacheKey, procedureBuilder);
    }

    return procedureBuilder;
}

export const AdminAuthorized = Authorized(['SUPER_ADMIN', 'ADMIN'], 'any');
