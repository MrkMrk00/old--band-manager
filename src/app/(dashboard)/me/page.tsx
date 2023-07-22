import { Button } from '@/view/layout';
import UserDetailsForm from './form/UserDetailsForm';

export const metadata = {
    title: 'Můj profil',
};

export default async function Me() {
    return (
        <main className="flex flex-col justify-center items-center mt-4 max-w-3xl w-11/12 mx-auto">
            <form action="/logout" method="POST" className="flex flex-row justify-end w-full mb-3">
                <input type="hidden" name="next" value="/" />
                <Button type="submit" className="bg-red-500">
                    Odhlásit se
                </Button>
            </form>
            <UserDetailsForm />
        </main>
    );
}
