import type { Database } from '@/database';

import t, { Language } from '@/i18n/translator';
import { ucfirst } from '@/lib/util';
import { TRPCError } from '@trpc/server';

export function createNotFound<K extends keyof Database>(
    entity?: K | (K extends `${infer LHS}s` ? LHS : never),
) {
    const entityStr = entity ? t('cs', 'entity', entity) : '';
    const str = ucfirst(`${entityStr} ${t('cs', 'errors', 'doesNotExist')}!`);

    return new TRPCError({
        code: 'NOT_FOUND',
        message: str,
    });
}

export function createServerError(
    text?: string,
    translate: boolean = false,
    ...translateOpts: string[]
) {
    if (translate && text) {
        text = t('cs', 'errors', text, ...translateOpts);
    }

    return new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: text ?? t('cs', 'errors', 'serverError', 'ucfirst', 'a:!'),
    });
}

export function createUnauthorized(lang: Language = 'cs') {
    return new TRPCError({
        code: 'UNAUTHORIZED',
        message: t(lang, 'errors', 'unauthorized', 'ucfirst', 'a:!'),
    });
}
