import { ReactNode } from 'react';
import { AdminNavigation } from './client';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex md:flex-row flex-col h-full w-full">
            <AdminNavigation className="md:w-1/5 md:max-w-md flex flex-col gap-2 bg-slate-100 p-4 shadow" />
            <main className="flex flex-row justify-center p-4 w-full">{children}</main>
        </div>
    );
}
