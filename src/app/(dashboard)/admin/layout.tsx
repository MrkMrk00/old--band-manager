import { ReactNode } from 'react';
import { AdminNavigation } from '@/app/(dashboard)/admin/client';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row pt-4">
            <AdminNavigation />
            <main className="w-full h-full">{children}</main>
        </div>
    );
}
