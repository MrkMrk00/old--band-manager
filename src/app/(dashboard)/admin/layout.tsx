import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Link } from '@/view/layout';
import { twMerge } from 'tailwind-merge';
import { FaMusic, FaUser } from 'react-icons/fa6';
import { FaHome } from 'react-icons/fa';

export const metadata = {
    title: 'Nastavení aplikace',
};

function SettingsButton(props: ComponentPropsWithRef<typeof Link>) {
    const { className, children, ...other } = props;

    return (
        <Link
            {...other}
            className={twMerge(
                `px-10 rounded-md shadow-none border text-center inline-flex flex-row justify-center items-center
                hover:border-green-500 transition-colors`,
                className,
            )}
        >
            {children}
        </Link>
    );
}

SettingsButton.Icon = function ({ children }: { children?: ReactNode }) {
    return (
        <span
            className="absolute w-full h-full inline-flex justify-start items-center px-4 hover:text-green-500 transition-colors"
        >
            {children}
        </span>
    );
};

SettingsButton.Title = function ({ children }: { children?: ReactNode }) {
    return <span className="w-full inline-flex justify-center items-center">{children}</span>;
};

export default function MenuTemplate({ children }: { children?: ReactNode }) {
    return (
        <div className="flex md:flex-row flex-col h-full w-full">
            <aside className="md:max-w-sm min-w-fit w-full flex flex-col gap-2 bg-slate-100 p-4 shadow">
                <span className="mx-auto">Sekce nastavení</span>

                <SettingsButton href="/admin">
                    <SettingsButton.Icon>
                        <FaHome />
                    </SettingsButton.Icon>
                    <SettingsButton.Title>Domovská stránka</SettingsButton.Title>
                </SettingsButton>

                <SettingsButton href="/admin/instruments">
                    <SettingsButton.Icon>
                        <FaMusic />
                    </SettingsButton.Icon>
                    <SettingsButton.Title>Nástroje</SettingsButton.Title>
                </SettingsButton>

                <SettingsButton href="/admin/users">
                    <SettingsButton.Icon>
                        <FaUser />
                    </SettingsButton.Icon>
                    <SettingsButton.Title>Uživatelé</SettingsButton.Title>
                </SettingsButton>
            </aside>
            <main className="flex flex-row justify-center p-4 w-full">{children}</main>
        </div>
    );
}
