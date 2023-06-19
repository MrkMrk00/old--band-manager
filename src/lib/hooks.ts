import { cookies } from 'next/headers';
import { COOKIE_SETTINGS, decodeJWT, verifyJWT } from '@/lib/auth/jwt';
import { UserRepository } from '@/lib/repositories';
import type { User } from '@/model/user';

type AppSession = {
    id: number;
    display_name: string;
};

async function verifyToken(jwtToken: string | undefined): Promise<boolean> {
    return !!jwtToken && !!await verifyJWT(jwtToken);
}

export async function useSession(): Promise<AppSession | null> {
    const token = cookies().get(COOKIE_SETTINGS.name);
    const correct = await verifyToken(token?.value);

    if (!correct) { return null; }
    const session = decodeJWT(token!.value);

    if (!('id' in session) || !('display_name' in session)) { return null; }

    return session as AppSession;
}

export async function useUser() {
    const session = await useSession();
    if (!session) { return null; }

    return (await UserRepository.findById(session.id) as unknown) as User;
}
