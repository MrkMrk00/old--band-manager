import { z } from 'zod';

const instrumentInsertable = z.object({
    name: z.string().max(511),
    subname: z.string().max(511).optional(),
    created_by: z.number().int(),
    icon: z.string().url().optional(),
});

const instrumentUpdatable = instrumentInsertable.partial().extend({
    id: z.number().int().min(0),
});

export const InstrumentsValidator = {
    checkInsertable: instrumentInsertable,
    checkUpdatable: instrumentUpdatable,
} as const;
