import type { TrpcContext } from '@/lib/trcp/context';
import type { Role } from '@/model/user';
import { initTRPC, TRPCError } from '@trpc/server';
import { UsersRepository, asUser } from '@/lib/repositories';

const t = initTRPC.context<TrpcContext>().create();

export const Router = t.router;
export const Middleware = t.middleware;
export const Public = t.procedure;

const userAuthMiddleware = Middleware(async function ({ ctx, next }) {
    if (!ctx.user) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            cause: 'Wrong token supplied in X-TOKEN header.',
        });
    }

    const user = await UsersRepository.findById(ctx.user.id).executeTakeFirst();

    if (!user) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            cause: `User ${ctx.user.id} does not exist.`,
        });
    }

    return next({
        ctx: { user },
    });
});

export const Authenticated = Public.use(userAuthMiddleware);

const roleMiddlewareCache: Map<string, typeof Authenticated> = new Map();

function createUnauthorizedError(): TRPCError {
    return new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You don\'t have access to this resource!',
    });
}

function createAuthorizedProcedure(roles: Role[], query: 'any' | 'all' = 'any') {
    return Authenticated.use(async function ({ ctx, next }) {
        const user = asUser(ctx.user);

        if (roles.length < 1) {
            return next();
        }

        switch (query) {
            case 'all': {
                if (user.hasAllRoles(roles)) {
                    return next();
                }

                throw createUnauthorizedError();
            }

            case 'any': {
                for (const role of roles) {
                    if (user.hasRole(role)) {
                        return next();
                    }
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
