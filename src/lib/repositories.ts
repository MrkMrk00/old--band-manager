import { Repository } from '@/lib/internal/Repository';
import { User } from '@/model/user';

class UserCustomRepository extends Repository<'users'> {
    constructor() {
        super('users');
    }

    // @ts-ignore
    async findById(id: number): Promise<User | null> {
        return (await super.findById(id)) as unknown as Promise<User | null>;
    }
}

export const UsersRepository = new UserCustomRepository();
export const InstrumentsRepository = new Repository('instruments');
