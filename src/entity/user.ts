import { Generated } from 'kysely';
import { cookies } from 'next/headers';
import { COOKIE_SETTINGS, verifyJWT, decodeJWT } from '@/lib/auth/jwt';

export type AuthType = 'native' | 'facebook';
export type Role = 'ADMIN' | 'USER';

export const TABLE_NAME = 'users';

export interface User {
    id: Generated<number>;
    display_name: string;
    auth_type: AuthType;
    auth_secret: string;
    roles: Role[];
}

type PersistentUser = {
    id: number;
    display_name: string;
};

export async function useUser$(): Promise<PersistentUser | null> {
    const token = cookies().get(COOKIE_SETTINGS.name);
    if (typeof token === 'undefined' || !(await verifyJWT(token.value))) {
        return null;
    }

    return decodeJWT(token.value) as PersistentUser;
}