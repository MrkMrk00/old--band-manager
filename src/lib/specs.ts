import type { SelectQueryBuilder, SimpleReferenceExpression } from 'kysely';
import type { Database } from '@/database';
import { query } from '@/lib/repositories';
import { sql } from 'kysely/dist/esm';

export function inIntArray<
    Table extends keyof Database,
    TField extends SimpleReferenceExpression<Database, Table>,
    O,
>(field: TField, ids: number[] | undefined) {
    type QB = SelectQueryBuilder<Database, Table, O>;
    return function (qb: QB): QB {
        if (ids && ids.length > 0) {
            // @ts-ignore
            return qb.where(field, 'in', ids);
        }

        return qb;
    };
}

export async function countAll(table: keyof Database): Promise<number> {
    const result = await query()
        .selectFrom(table)
        .select(sql<number>`COUNT(*)`.as('count'))
        .executeTakeFirst();

    return result?.count ?? 0;
}
