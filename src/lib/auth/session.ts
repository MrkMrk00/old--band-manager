import { cookies } from 'next/headers';
import { signJWT } from '@/lib/auth/jwt';
import type { PersistentUser } from '@/model/user';
import env from '@/env.mjs';

export const COOKIE_SETTINGS = {
    name: 'BAND_MANAGER_AUTH',
    httpOnly: false,
    path: '/',
    secure: env.NODE_ENV === 'production',
};

export type Session = PersistentUser;

export async function sendSession<T extends Session>(data: T) {
    // @ts-ignore
    cookies().set({
        ...COOKIE_SETTINGS,
        value: await signJWT(data),
    });
}
