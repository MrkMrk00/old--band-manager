import getRepositoryFor from '@/lib/repositories';
import type { TrpcContext } from '@/lib/trcp/context';
import { createUnauthorized } from '@/lib/trcp/errors';
import type { Role } from '@/model/user';
import { TRPCError, initTRPC } from '@trpc/server';

const t = initTRPC.context<TrpcContext>().create();

export const Router = t.router;
export const Middleware = t.middleware;
export const Public = t.procedure;

export const Authenticated = Public.use(function ({ ctx, next }) {
    if (!ctx.user) {
        throw createUnauthorized();
    }

    return next({
        ctx,
    });
});

const roleMiddlewareCache: Map<string, typeof Authenticated> = new Map();

function createAuthorizedProcedure(roles: Role[], query: 'any' | 'all' = 'any') {
    return Authenticated.use(async function ({ ctx, next }) {
        const userRolesResult = await getRepositoryFor('users')
            .select()
            .select('users.roles')
            .where('users.id', '=', ctx.user.id)
            .executeTakeFirst();

        let userRoles: string[];

        if (!userRolesResult?.roles || userRolesResult.roles.length < 1) {
            userRoles = [];
        } else {
            userRoles = userRolesResult.roles;
        }

        switch (query) {
            case 'all': {
                if (roles.every(r => userRoles.includes(r))) {
                    return next();
                }

                throw createUnauthorized();
            }

            case 'any': {
                if (roles.some(r => userRoles.includes(r))) {
                    return next();
                }

                throw createUnauthorized();
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
