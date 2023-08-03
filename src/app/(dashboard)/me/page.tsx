import { Button } from '@/view/layout';
import UserDetailsForm from '@/view/entity-form/user';

export const metadata = {
    title: 'Můj profil',
};

export default async function Me() {
    return (
        <main className="flex flex-col justify-center items-center mt-4 max-w-3xl w-11/12 mx-auto gap-5">
            <form action="/logout" method="POST" className="flex flex-row justify-end w-full">
                <Button type="submit" className="bg-red-500">
                    Odhlásit se
                </Button>
            </form>

            <UserDetailsForm />
        </main>
    );
}
