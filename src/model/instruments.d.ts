import type { Generated } from 'kysely';

export type InstrumentDatabase = {
    id: Generated<number>;
    name: string;
    subname?: string;
    created_by: number;
    icon?: string;

    created_at: Generated<string>;
    updated_at: Generated<string>;
};
