import type { Generated } from 'kysely';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type SongDatabase = {
    id: Generated<number>;
    number: string; // varchar(63)
    name: string;

    composer: string | null;
    arranger: string | null;

    link: string | null;
    custom_data: Record<string, string | number | object>;

    created_by: number;
    created_at: Generated<string>;
    updated_at: Generated<string>;
};

export type Song = Selectable<SongDatabase>;
export type NewSong = Insertable<SongDatabase>;
export type UpdatableSong = Updateable<SongDatabase>;

export type SheetDatabase = {
    id: Generated<number>;
    id_song: number;
    id_instrument: number | null;

    link: string | null;
    format: string | null;
    description: string | null;
    custom_data: Record<string, string | number | object>;

    created_by: number;
    created_at: Generated<string>;
    updated_at: Generated<string>;
};

export type Sheet = Selectable<SheetDatabase>;
export type NewSheet = Insertable<SheetDatabase>;
export type UpdatableSheet = Updateable<SheetDatabase>;
