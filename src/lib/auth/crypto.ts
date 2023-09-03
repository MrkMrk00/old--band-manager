import argon, { argon2id, type Options } from 'argon2';
import env from '@/env.mjs';

const appSecret = Buffer.from(new TextEncoder().encode(env.APP_SECRET));

const argonOptions = {
    type: argon2id,
    secret: appSecret,
    raw: false,
} satisfies Options;

export const ArgonUtil = {
    hash(password: string): Promise<string> {
        return argon.hash(password, argonOptions);
    },

    verify(password: string, hash: string): Promise<boolean> {
        return argon.verify(hash, password, argonOptions);
    },
} as const;
