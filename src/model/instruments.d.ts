import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export type InstrumentDatabase = {
    id: Generated<number>;
    name: string;
    subname?: string;
    created_by: number;
    icon?: string;

    created_at: Generated<string>;
    updated_at: Generated<string>;
};

export type Instrument = Selectable<InstrumentDatabase>;
export type NewInstrument = Insertable<InstrumentDatabase>;
export type UpdatableInstrument = Updateable<InstrumentDatabase>;
