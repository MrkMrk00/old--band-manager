import FacebookLoginButton from '@/lib/facebook_auth/FacebookLoginButton';

export default function LoginPage() {
    return (
        <main className="login-content-container">
            <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold">Přihlásit se</h3>
                <FacebookLoginButton />
            </div>
        </main>
    );
};