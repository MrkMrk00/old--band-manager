import type { PersistentUser } from '@/model/user';
import env from '@/env.mjs';
import { NextRequest } from 'next/server';
import { JWTPayload, type JWTVerifyResult, SignJWT, jwtVerify, decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import { UsersRepository } from '@/lib/repositories';

const alg = 'HS384';
const secret = new TextEncoder().encode(env.APP_SECRET);
const expiration = '72h';

export function signJWT(payload: Record<string, string | number>): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer(env.DOMAIN)
        .setExpirationTime(expiration)
        .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTVerifyResult | null> {
    try {
        return await jwtVerify(token, secret, {
            issuer: env.DOMAIN,
        });
    } catch (ignore: unknown) {}

    return null;
}

export function decodeJWT(token: string): JWTPayload {
    return decodeJwt(token);
}
import { User } from '@/model/user';

export const COOKIE_SETTINGS = {
    name: 'BAND_MANAGER_AUTH',
    httpOnly: false, // tRPC has to have access
    path: '/',
    secure: env.NODE_ENV === 'production',
};

export type Session = PersistentUser;

export async function createSessionCookie(
    data: Record<string, number | string>,
): Promise<Record<string, number | string | boolean>> {
    return {
        ...COOKIE_SETTINGS,
        value: await signJWT(data),
    };
}

type AppSession = {
    id: number;
    display_name: string;
};

async function verifyToken(jwtToken: string | undefined): Promise<boolean> {
    return !!jwtToken && !!(await verifyJWT(jwtToken));
}

export async function getSession(req?: NextRequest): Promise<(AppSession & JWTPayload) | null> {
    let token: string | undefined;

    if (req) {
        token = req.cookies.get(COOKIE_SETTINGS.name)?.value;
    } else {
        token = cookies().get(COOKIE_SETTINGS.name)?.value;
    }

    if (!token || !(await verifyToken(token))) {
        return null;
    }

    const session = decodeJWT(token);

    if (!('id' in session) || !('display_name' in session)) {
        return null;
    }

    return session as AppSession & JWTPayload;
}

export async function useUser() {
    const session = await getSession();
    if (!session) {
        return null;
    }

    return (await UsersRepository.findById(session.id).executeTakeFirst()) as unknown as User;
}
