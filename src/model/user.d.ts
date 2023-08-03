import type { Generated, Selectable } from 'kysely';

export type SystemRole = 'SUPER_ADMIN' | 'ADMIN';
export type Role = SystemRole;

export interface UserDatabase {
    id: Generated<number>;
    display_name: string;
    email?: string;
    password?: string;
    fb_id?: number;
    roles: Role[];

    created_at: Generated<string>;
    updated_at: Generated<string>;
}

export type PersistentUser = {
    id: number;
    display_name: string;
};

export type User = Selectable<UserDatabase>;
