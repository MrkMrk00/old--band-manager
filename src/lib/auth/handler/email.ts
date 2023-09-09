import { AsyncAuthResponse, AuthHandler } from '@/lib/auth/utils';
import { UsersRepository } from '@/lib/repositories';
import env from '@/env.mjs';
import { ArgonUtil } from '@/lib/auth/crypto';
import { type InsertResult, sql } from 'kysely';
import Logger from '@/lib/logger';
import { User } from '@/model/user';

export default class DatabaseAuthHandler implements AuthHandler<string, User, undefined> {
    async accept(request: Request): AsyncAuthResponse<User, undefined> {
        let formdata;

        try {
            formdata = await request.formData();
        } catch (e: unknown) {
            return undefined;
        }

        const email = String(formdata.get('email') ?? '');
        const password = String(formdata.get('password') ?? '');

        const userObj = await UsersRepository.selectQb()
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
        const qb = UsersRepository.insertQb().values({
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
