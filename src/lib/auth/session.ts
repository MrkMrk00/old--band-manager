import { cookies } from 'next/headers';
import { signJWT } from '@/lib/auth/jwt';
import env from '@/env.mjs';

export const COOKIE_SETTINGS = {
    name: 'BAND_MANAGER_AUTH',
    httpOnly: false,
    path: '/',
    secure: env.NODE_ENV === 'production',
};

export type SessionUser = {
    id: number;
    display_name: string;
};

export type Session = SessionUser;

export async function sendSession<T extends Session>(data: T) {
    // @ts-ignore
    cookies().set({
        ...COOKIE_SETTINGS,
        value: await signJWT(data),
    });
}
