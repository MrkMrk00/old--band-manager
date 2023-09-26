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

const userInsertable = z.object({
    display_name: z.string().max(512).min(1),
    email: z.string().email().max(512),
    password: z.string().min(6).max(255),
    roles: z.array(z.string()).optional(),
});

const userUpdatable = z
    .object({
        id: z.number().int().min(0),
    })
    .merge(userInsertable.partial());

const userUpsertable = z.union([userUpdatable, userInsertable]);

export const UsersValidator = {
    checkInsertable: userInsertable,
    checkUpdatable: userUpdatable,
    checkUpsertable: userUpsertable,
} as const;
