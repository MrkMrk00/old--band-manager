import type { Generated, SelectType } from 'kysely';

export type InstrumentDatabase = {
    id: Generated<number>;
    name: string;
    subname?: string;
    created_by: number;
    icon?: string;

    created_at: Generated<Date>;
    updated_at: Generated<Date>;
};

export type Instrument = {
    [key in keyof InstrumentDatabase]: SelectType<InstrumentDatabase[key]>;
};
