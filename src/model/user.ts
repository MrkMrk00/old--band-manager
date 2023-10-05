import type { Generated, RawBuilder, SelectType, Selectable } from 'kysely';
import { sql } from 'kysely';
import { ArgonUtil } from '@/lib/auth/crypto';

export type SystemRole = 'SUPER_ADMIN' | 'ADMIN';
export type Role = SystemRole;

export interface UserDatabase {
    id: Generated<number>;
    display_name: string;
    email: string | null;
    password: string | null;
    fb_id: number | null;
    roles: Role[] | null;

    created_at: Generated<string>;
    updated_at: Generated<string>;
}

export type PersistentUser = {
    id: number;
    display_name: string;
};

export type UserObject = Selectable<UserDatabase>;

/** @depracated stejně se to nedá posílat na FE, takže to je k ničemu */
export class User {
    constructor(public _object: UserObject) {}

    hasRole(role: Role): boolean {
        return !!this.roles?.includes(role);
    }

    hasAllRoles(roles: Role[]): boolean {
        if (!this.roles) {
            return false;
        }

        if (roles.length < 1) {
            return true;
        }

        if (this.roles.length < 1) {
            return false;
        }

        for (const role of roles) {
            if (!this.roles.includes(role)) {
                return false;
            }
        }

        return true;
    }

    verifyPassword(plaintextPassword: string): Promise<boolean> {
        if (!this.password || plaintextPassword === '') {
            return Promise.resolve(false);
        }

        return ArgonUtil.verify(plaintextPassword, this.password);
    }

    toPersistentUser(): PersistentUser {
        return { id: this.id as number, display_name: this.display_name as string };
    }

    get id(): SelectType<UserDatabase['id']> {
        return this._object.id;
    }

    get email(): SelectType<UserDatabase['email']> {
        return this._object.email;
    }

    set email(value: SelectType<UserDatabase['email']>) {
        this._object.email = value;
    }

    get display_name(): SelectType<UserDatabase['display_name']> {
        return this._object.display_name;
    }

    set display_name(value: SelectType<UserDatabase['display_name']>) {
        this._object.display_name = value;
    }

    get password(): SelectType<UserDatabase['password']> {
        return this._object.password;
    }

    set password(value: SelectType<UserDatabase['password']>) {
        this._object.password = value;
    }

    get fb_id(): SelectType<UserDatabase['fb_id']> {
        return this._object.fb_id;
    }

    set fb_id(value: SelectType<UserDatabase['fb_id']>) {
        this._object.fb_id = value;
    }

    get roles(): SelectType<UserDatabase['roles']> {
        return this._object.roles;
    }

    set roles(value: SelectType<UserDatabase['roles']>) {
        this._object.roles = value;
    }

    get created_at(): SelectType<UserDatabase['created_at']> {
        return this._object.created_at;
    }

    set created_at(value: SelectType<UserDatabase['created_at']>) {
        this._object.created_at = value;
    }

    get updated_at(): SelectType<UserDatabase['updated_at']> {
        return this._object.updated_at;
    }

    set updated_at(value: SelectType<UserDatabase['updated_at']>) {
        this._object.updated_at = value;
    }
}

const userUtils = {
    getRolesSQL(user: { roles: Role[] | null }): RawBuilder<Role[]> {
        if (user.roles === null) {
            return sql`[]`;
        }

        return sql`[${user.roles.map(r => `"${r}"`).join(',')}]`;
    },

    verifyPassword(
        user: { password: UserObject['password'] },
        plainTextPassword: string,
    ): Promise<boolean> {
        if (!user.password || plainTextPassword === '') {
            return Promise.resolve(false);
        }

        return ArgonUtil.verify(plainTextPassword, user.password);
    },
};

declare global {
    interface ProxyConstructor {
        new <TSource extends object, TTarget extends object>(
            target: TSource,
            handler: ProxyHandler<TSource>,
        ): TTarget & TSource;
    }
}

type FuncWithoutFirst<Func> = Func extends (a: any, ...args: infer ArgT) => infer Return
    ? (...args: ArgT) => Return
    : Func;
type UserUtilsWithForwardedUser = {
    [key in keyof typeof userUtils]: (typeof userUtils)[key] extends Function
        ? FuncWithoutFirst<(typeof userUtils)[key]>
        : (typeof userUtils)[key];
};

export function withUser<T extends Partial<UserObject>>(
    userObj: T,
): T & UserUtilsWithForwardedUser {
    return new Proxy<T, UserUtilsWithForwardedUser>(userObj, {
        get(target: T, p: string | symbol, receiver: any): any {
            if (p in userUtils) {
                // @ts-ignore bohužel :)
                return userUtils[p].bind(userUtils, target);
            }

            return target[p as keyof typeof target];
        },
    });
}

export default userUtils;
