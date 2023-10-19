import type { Role, UserObject } from '@/model/user';
import createProxyProvider from '@/lib/entity-utils/entity-proxy';
import { createContext, useContext } from 'react';

const clientSideUserUtils = {
    hasRole(user: { roles: Role[] | null }, role: Role): boolean {
        return user.roles?.includes(role) ?? false;
    },

    isAdmin(user: { roles: Role[] | null }) {
        return this.hasRole(user, 'ADMIN') || this.hasRole(user, 'SUPER_ADMIN');
    },

    unwrap(user: UserObject) {
        return user;
    },
};

/**
 * Wrap user CLIENT SIDE
 */
export const wrapUserCS = createProxyProvider<UserObject, typeof clientSideUserUtils>(clientSideUserUtils);

export type UserProxyCS = ReturnType<typeof wrapUserCS<UserObject>>;

export const UserContext = createContext<UserProxyCS | null>(null);

export function useUser(): UserProxyCS {
    const user = useContext(UserContext);

    return user!;
}
