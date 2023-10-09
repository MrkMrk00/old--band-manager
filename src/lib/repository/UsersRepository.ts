import { Kysely, UpdateResult } from 'kysely';
import { Database } from '@/database';
import { ArgonUtil } from '@/lib/auth/crypto';
import { Repository } from '@/lib/entity-utils/Repository';

export default class UsersRepository extends Repository<'users'> {
    constructor(db: Kysely<Database>) {
        super(db, 'users');
    }

    async updatePassword(
        idOrUser: number | { id: number },
        newPassword: string,
    ): Promise<UpdateResult> {
        const id = typeof idOrUser === 'number' ? idOrUser : idOrUser.id;

        const passwordHash = await ArgonUtil.hash(newPassword);

        return await this.update()
            .where('id', '=', id)
            .set({ password: passwordHash })
            .executeTakeFirst();
    }
}
