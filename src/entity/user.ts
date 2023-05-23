import { Generated } from 'kysely';

export type AuthType = 'native' | 'facebook';
export type Role = 'ADMIN' | 'USER';

export const TABLE_NAME = 'users';

export interface User {
    id: Generated<number>;
    display_name: string;
    auth_type: AuthType;
    auth_secret: string;
    roles: Role[];
}