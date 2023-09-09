import argon, { type Options } from 'argon2';

const argonOptions = {
    raw: false,
    type: argon.argon2id,
} satisfies Options;

export const ArgonUtil = {
    hash(password: string): Promise<string> {
        return argon.hash(password, argonOptions);
    },

    verify(password: string, hash: string): Promise<boolean> {
        return argon.verify(hash, password, argonOptions);
    },
} as const;
