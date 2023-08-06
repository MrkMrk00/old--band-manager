import argon, { argon2id, type Options as ArgonOptions } from 'argon2';
import env from '@/env.mjs';

const appSecret = Buffer.from(new TextEncoder().encode(env.APP_SECRET));

const argonOptions: ArgonOptions & { raw: true } = {
    type: argon2id,
    secret: appSecret,
    raw: true,
};

export const ArgonUtil = {
    async hash(password: string) {
        return await argon.hash(password, argonOptions);
    },

    verify(password: string, hash: string) {

    },
};