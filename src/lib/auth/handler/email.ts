import { type InsertResult, sql } from 'kysely';
import { NextRequest } from 'next/server';
import env from '@/env.mjs';
import { AppError, AsyncAuthResponse, AuthHandler } from '@/lib/auth/contracts';
import { ArgonUtil } from '@/lib/auth/crypto';
import { Repository } from '@/lib/entity-utils/Repository';
import Logger from '@/lib/logger';
import { UsersRepository } from '@/lib/repositories';
import { User, UserProxy, wrapUser } from '@/model/user';

export class _DatabaseAuthHandler implements AuthHandler<string, User, undefined> {
    async accept(request: Request): AsyncAuthResponse<User, undefined> {
        let formdata;

        try {
            formdata = await request.formData();
        } catch (e: unknown) {
            return undefined;
        }

        const email = String(formdata.get('email') ?? '');
        const password = String(formdata.get('password') ?? '');

        const userObj = await UsersRepository.select()
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst();

        const user = userObj ? new User(userObj) : null;

        if (!user || !(await user.verifyPassword(password))) {
            return undefined;
        }

        return user;
    }

    async getUserInfo(identifier: string): AsyncAuthResponse<User, undefined> {
        const userObj = await UsersRepository.one()
            .where('email', '=', identifier)
            .executeTakeFirst();
        if (!userObj) {
            return undefined;
        }

        return new User(userObj);
    }

    async verifyUser(identifier: string): Promise<boolean> {
        return (await this.getUserInfo(identifier)) !== undefined;
    }
}

export async function ensureAdminUser(): Promise<void> {
    if (env.NODE_ENV !== 'development') {
        return;
    }

    const logger = Logger.fromEnv();

    const exists = await UsersRepository.one()
        .where('email', '=', 'admin@admin.com')
        .executeTakeFirst();

    if (!exists) {
        const qb = UsersRepository.insert().values({
            display_name: 'ADMIN',
            email: 'admin@admin.com',
            password: await ArgonUtil.hash('admin'),
            roles: sql`'["SUPER_ADMIN"]'`,
        });

        let result: InsertResult;

        try {
            result = await qb.executeTakeFirst();
        } catch (e: any) {
            logger.error('Failed to create admin user', { error: e });
            return;
        }

        logger.info('Successfully created admin user', { id: Number(result.insertId) });
    }
}

export default class DatabaseAuthHandler implements AuthHandler<string, UserProxy, AppError> {
    #users: Repository<'users'>;

    constructor(usersRepository: Repository<'users'>) {
        this.#users = usersRepository;
    }

    async accept(request: NextRequest): AsyncAuthResponse<UserProxy, AppError> {
        let formData;

        try {
            formData = await request.formData();
        } catch (e: unknown) {
            return AppError.createTranslatable('badRequest');
        }

        const email = String(formData.get('email') ?? '');
        const password = String(formData.get('password') ?? '');

        if (!email || !password) {
            return AppError.createTranslatable('wrongEmailOrPassword');
        }

        const user = await this.#users
            .one()
            .where('email', '=', email)
            .where('email', 'is not', null)
            .executeTakeFirst();

        const proxy = user ? wrapUser(user) : null;

        if (!proxy || !proxy.verifyPassword(password)) {
            return AppError.createTranslatable('wrongEmailOrPassword');
        }

        return proxy;
    }

    async getUserInfo(identifier: string): AsyncAuthResponse<UserProxy, AppError> {
        const user = await this.#users
            .one()
            .where('email', '=', identifier)
            .where('email', 'is not', null)
            .executeTakeFirst();

        if (!user) {
            return AppError.createTranslatable('notFound');
        }

        return wrapUser(user);
    }

    async verifyUser(identifier: string): Promise<boolean> {
        return !AppError.isError(await this.getUserInfo(identifier));
    }
}
