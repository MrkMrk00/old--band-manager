import { AsyncAuthResponse, AuthHandler, MethodNotImplementedError } from '@/lib/auth/utils';
import { User } from '@/model/user';
import { UsersRepository } from '@/lib/repositories';

export default class DatabaseAuthHandler implements AuthHandler<string, User, undefined> {

    accept(request: Request): AsyncAuthResponse<User, undefined> {
        throw new MethodNotImplementedError();
    }

    async getUserInfo(identifier: string): AsyncAuthResponse<User, undefined> {
        return await UsersRepository.one()
            .where('email', '=', identifier)
            .executeTakeFirst();
    }

    async verifyUser(identifier: string): Promise<boolean> {
        return (await this.getUserInfo(identifier)) !== undefined;
    }
}