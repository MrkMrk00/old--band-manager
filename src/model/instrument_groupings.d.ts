import type { Generated } from 'kysely';
import { Insertable, Selectable, Updateable } from 'kysely';

export type InstrumentGroupingDatabase = {
    id: Generated<number>;
    name: string;

    created_by: number;

    created_at: Generated<string>;
    updated_at: Generated<string>;
};

export type InstrumentGrouping = Selectable<InstrumentGroupingDatabase>;
export type NewInstrumentGrouping = Insertable<InstrumentGroupingDatabase>;
export type UpdatableGrouping = Updateable<InstrumentGroupingDatabase>;
