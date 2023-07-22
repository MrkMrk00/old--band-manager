import { Authenticated, Router } from '@/lib/trcp/server';
import { InstrumentsRepository } from '@/lib/repositories';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export default Router({
    fetchAll: Authenticated.input(
        z.object({
            page: z.number().min(1).optional().default(1),
        }),
    ).query(async ({ input }) => {
        return await InstrumentsRepository.all(input.page ?? 1).execute();
    }),

    one: Authenticated.input(z.number().int().min(0)).query(
        async ({ input }) => await InstrumentsRepository.findById(input),
    ),

    upsert: Authenticated.input(
        z.object({
            id: z
                .string()
                .optional()
                .transform(s => (!s ? undefined : +s)),
            name: z.string().min(1).max(512),
            subname: z
                .string()
                .max(512)
                .optional()
                .transform(s => (!s ? undefined : s)),
            icon: z
                .string()
                .optional()
                .transform(s => (!s || !z.string().url().parse(s) ? undefined : s)),
        }),
    ).mutation(async ({ ctx, input }) => {
        if (typeof input.id === 'undefined') {
            const result = await InstrumentsRepository.insert()
                .values({
                    name: input.name,
                    subname: input.subname,
                    icon: input.icon,
                    created_by: ctx.user.id,
                })
                .execute();

            if (result.length !== 1) {
                throw new TRPCError({
                    message: 'Failed to insert a new instrument',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            return Number(result[0].insertId);
        }

        const result = await InstrumentsRepository.update({ id: input.id })
            .set({
                name: input.name,
                subname: input.subname,
                icon: input.icon,
            })
            .execute();

        if (result.length !== 1) {
            throw new TRPCError({
                message: 'Nevim',
                code: 'BAD_REQUEST',
            });
        }

        if (Number(result[0].numUpdatedRows) > 1) {
            throw new TRPCError({
                message: 'Kurva, zas to updatuje jinak než má',
                code: 'INTERNAL_SERVER_ERROR',
            });
        }

        return true;
    }),

    delete: Authenticated.input(z.number().int()).mutation(async ({ input, ctx }) => {
        const result = await InstrumentsRepository.delete(input).execute();

        if (result.length !== 1) {
            throw new TRPCError({
                message: 'Nevim',
                code: 'BAD_REQUEST',
            });
        }

        if (Number(result[0].numDeletedRows) > 1) {
            throw new TRPCError({
                message: 'Kurva, moc toho mažeš',
                code: 'INTERNAL_SERVER_ERROR',
            });
        }

        return true;
    }),
});
