import type { Instrument } from '@/model/instruments';
import { PersistentUser, Role, User } from '@/model/user';
import { ArgonUtil } from '@/lib/auth/crypto';

const instrumentProto = {
    getGroupingIds(): number[] {
        if (!('groupings' in this) || typeof this.groupings !== 'string') {
            return [];
        }

        return JSON.parse(this.groupings);
    },
};

export function asInstrument<T extends Instrument>(instrument: T): T & typeof instrumentProto {
    if (Object.getPrototypeOf(instrument) === instrumentProto) {
        return instrument as T & typeof instrumentProto;
    }

    return Object.setPrototypeOf(instrument, instrumentProto);
}

const userProto = {
    hasRole(role: Role): boolean {
        if (!('roles' in this) || !Array.isArray(this.roles)) {
            return false;
        }

        return this.roles.includes(role);
    },

    hasAllRoles(roles: Role[]): boolean {
        if (roles.length < 1) {
            return true;
        }

        if (!('roles' in this) || !Array.isArray(this.roles)) {
            return false;
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
    },

    verifyPassword(plaintextPassword: string): Promise<boolean> {
        if (!('password' in this)) {
            return Promise.reject();
        }

        if (typeof this.password !== 'string' || !this.password || plaintextPassword === '') {
            return Promise.resolve(false);
        }

        return ArgonUtil.verify(plaintextPassword, this.password);
    },

    /**
     * @throws TypeError if prototype assigned to a non-user object
     */
    toPersistentUser(): PersistentUser {
        if (!('id' in this) || !('display_name' in this)) {
            throw new TypeError('userProto assigned to a non user object!');
        }

        return { id: this.id as number, display_name: this.display_name as string };
    },
};

export function asUser<T extends User>(user: T): T & typeof userProto {
    if (Object.getPrototypeOf(user) === userProto) {
        return user as T & typeof userProto;
    }

    return Object.setPrototypeOf(user, userProto);
}
