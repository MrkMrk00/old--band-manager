import type { Generated } from 'kysely';
export type Role = 'ADMIN' | 'USER';

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

export type User = PersistentUser & {
    roles: Role[];

    created_at: string | Date;
    updated_at: string | Date;
} & (
        | { email: string; password: string; fb_id: null }
        | { fb_id: number; email: null; password: null }
    );
