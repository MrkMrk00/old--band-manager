import getRepositoryFor from "@/lib/repositories";
import { ChangeUser, RegisterNewUser } from "./interactive-forms";

export default async function UserFormServerComponent({ id }: { id: `${number}` | 'add' }) {
    if (id === 'add') {
        return <RegisterNewUser />;
    }

    const repo = getRepositoryFor('users');
    const user = await repo.findById(+id).executeTakeFirst();

    if (!user) {
        return <div className="text-xl font-bold">Nenalezeno!</div>;
    }

    return <ChangeUser user={user} />;
}
