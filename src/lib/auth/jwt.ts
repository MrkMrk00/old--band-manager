import { type JWTPayload, type JWTVerifyResult, SignJWT, jwtVerify, decodeJwt } from 'jose';
import env from '@/env.mjs';

const alg = 'HS384';
const secret = new TextEncoder().encode(env.APP_SECRET);
const expiration = '72h';

export const COOKIE_SETTINGS = {
    name: 'BAND_MANAGER_AUTH',
    httpOnly: false,
    path: '/',
    secure: env.NODE_ENV === 'production',
};

export function signJWT(payload: JWTPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer(env.DOMAIN)
        .setExpirationTime(expiration)
        .sign(secret);
}

export function verifyJWT(token: string): Promise<JWTVerifyResult> {
    return jwtVerify(token, secret, {
        issuer: env.DOMAIN,
    });
}

export function decodeJWT(token: string): JWTPayload {
    return decodeJwt(token);
}
