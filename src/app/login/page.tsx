import FacebookLoginButton from '@/components/FacebookLoginButton';
import { Button } from '@/components/layout';

export default function LoginPage() {
    return (
        <main className="flex flex-row justify-center items-center h-full">
            <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold">Přihlásit se</h3>
                <FacebookLoginButton />
                <Button>Tvoje mama</Button>
            </div>
        </main>
    );
}
