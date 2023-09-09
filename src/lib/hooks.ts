import { cookies } from 'next/headers';
import { COOKIE_SETTINGS, SessionReader } from '@/lib/auth/session';
import { UsersRepository } from '@/lib/repositories';

export async function useUser() {
    const reader = await SessionReader.fromToken(cookies().get(COOKIE_SETTINGS.name)?.value);
    if (!reader.isValid) {
        return null;
    }

    const user = await UsersRepository.findById(reader.payload.id).executeTakeFirst();

    return user ?? null;
}
