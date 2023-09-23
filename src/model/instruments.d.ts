import type { Generated } from 'kysely';

export type InstrumentDatabase = {
    id: Generated<number>;
    name: string;
    subname: string | null;
    created_by: number;
    icon: string | null;

    created_at: Generated<string>;
    updated_at: Generated<string>;
};
