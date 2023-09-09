import type { Generated, Insertable, Selectable, Updateable } from 'kysely';
import type { CustomData } from '@/database';

export type InstrumentGroupingDatabase = {
    id: Generated<number>;
    name: string;

    created_by: number;
    custom_data: CustomData;

    created_at: Generated<string>;
    updated_at: Generated<string>;
};

export type InstrumentGrouping = Selectable<InstrumentGroupingDatabase>;
export type NewInstrumentGrouping = Insertable<InstrumentGroupingDatabase>;
export type UpdatableGrouping = Updateable<InstrumentGroupingDatabase>;
