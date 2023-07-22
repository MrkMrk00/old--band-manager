import { z } from 'zod';

export type Pageable<T> = {
    page: number;
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
        maxPage: Math.floor(allCount / perPage) + 1,
    }),
};
