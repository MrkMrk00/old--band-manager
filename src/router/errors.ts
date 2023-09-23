import { TRPCError } from '@trpc/server';
import type { Database } from '@/database';
import { ucfirst } from '@/lib/util';
import t from '@/i18n/translator';

export async function createNotFound(entity?: keyof Database) {
    const entityStr = (entity ? (await t('cs', 'entity', entity)) ?? '' : '').toString();
    const str = ucfirst(`${entityStr} ${await t('cs', 'errors', 'doesNotExist')}!`);

    return new TRPCError({
        code: 'NOT_FOUND',
        message: str,
    });
}

export async function createServerError(
    text?: string,
    translate: boolean = false,
    ...translateOpts: string[]
) {
    if (translate && text) {
        text = await t('cs', 'errors', text, ...translateOpts);
    }

    return new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: text,
    });
}
