import type { Instrument } from '@/model/instruments';
import { Role, User } from '@/model/user';

const instrumentProto = {
    getGroupingIds(): number[] {
        if (!('groupings' in this) || typeof this.groupings !== 'string') {
            return [];
        }

        return JSON.parse(this.groupings);
    }
};

export function asInstrument(instrument: Instrument): Instrument & typeof instrumentProto {
    if (Object.getPrototypeOf(instrument) === instrumentProto) {
        return instrument as Instrument  & typeof instrumentProto;
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

    hasAllRoles(roles: Role[]) {
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
};

export function asUser<T extends User>(user: T): T & typeof userProto {
    if (Object.getPrototypeOf(user) === userProto) {
        return user as T & typeof userProto;
    }

    return Object.setPrototypeOf(user, userProto);
}
