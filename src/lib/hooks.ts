import { cookies, headers } from 'next/headers';
import { COOKIE_SETTINGS, decodeJWT, verifyJWT } from '@/lib/auth/jwt';
import type { User } from '@/model/user';
import db from '@/database';

type PersistentUser = {
    id: number;
    display_name: string;
};

type TUseUserRet<T extends boolean> = T extends true ? User | null : PersistentUser | null;

export async function useUser$<T extends boolean>(
    fetchFullUser: T = <T>false,
): Promise<TUseUserRet<T>> {
    const token = cookies().get(COOKIE_SETTINGS.name);
    if (typeof token === 'undefined' || !(await verifyJWT(token.value))) {
        return <TUseUserRet<T>>null;
    }

    const persistentUser = decodeJWT(token.value) as PersistentUser;
    if (!fetchFullUser) {
        return <TUseUserRet<T>>persistentUser;
    }

    const result = await db
        .selectFrom('users')
        .selectAll()
        .where('users.id', '=', persistentUser.id)
        .executeTakeFirst();

    if (typeof result === 'undefined') {
        return <TUseUserRet<T>>null;
    }

    return <TUseUserRet<T>>(result as unknown);
}
