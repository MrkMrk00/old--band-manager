import type { Generated } from 'kysely';
export type Role = 'ADMIN' | 'USER';

export interface UserDatabase {
    id: Generated<number>;
    display_name: string;
    email?: string;
    password?: string;
    fb_id?: number;
    roles: Role[];

    created_at: Generated<number>;
    updated_at: Generated<number>;
}

export type PersistentUser = {
    id: number;
    display_name: string;
};

export type User = PersistentUser & {
    roles: Role[];

    created_at: number;
    updated_at: number;
} & (
    | { email: string; password: string; fb_id: null }
    | { fb_id: number; email: null; password: null }
);