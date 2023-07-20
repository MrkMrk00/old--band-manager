import { Authenticated, Router } from '@/lib/trcp/server';
import { InstrumentsRepository } from '@/lib/repositories';
import { z } from 'zod';

export default Router({
    fetchAll: Authenticated.input(
        z.object({
            page: z.number().min(1).nullable(),
        }),
    ).query(async ({ input }) => {
        return await InstrumentsRepository.all(input.page ?? 1).execute();
    }),
});
