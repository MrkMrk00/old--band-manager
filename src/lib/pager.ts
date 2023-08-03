import { z } from 'zod';
import type { SelectQueryBuilder } from 'kysely';

export type Pageable<T> = {
    maxPage: number;
    payload: T[];
};

export const Pager = {
    /** #const */
    input: z.object({
        page: z.number().int().min(1).optional().default(1),
        perPage: z.number().int().min(0).optional().default(20),
    }),

    /** #pure */
    query: (allCount: number, perPage: number, curPage: number) => ({
        offset: perPage * (curPage - 1),
        maxPage: Math.ceil(allCount / perPage),
    }),

    handleQuery: function <D, T extends keyof D, O>(
        queryBuilder: SelectQueryBuilder<D, T, O>,
        allCount: number,
        perPage: number,
        curPage: number,
    ) {
        const { maxPage, offset } = this.query(allCount, perPage, curPage);
        if (offset !== 0) {
            queryBuilder = queryBuilder.offset(offset);
        }

        if (perPage < Number.MAX_SAFE_INTEGER) {
            queryBuilder = queryBuilder.limit(perPage);
        }

        return {
            maxPage,
            perPage,
            queryBuilder,
        };
    },
};
