'use client';

import UsersList from '@/view/entity-list/users';
import { Link } from '@/view/layout';
import { FaPlus } from 'react-icons/fa6';

export default function UsersAdminPage() {
    return (
        <div className="flex flex-col w-full items-center">
            <div className="w-full h-full max-w-2xl flex flex-col gap-5">
                <div className="flex flex-row justify-end">
                    <Link href="/admin/users/add" className="bg-green-300 inline-flex items-center">
                        <FaPlus />&emsp;Přidat
                    </Link>
                </div>
                <UsersList />
            </div>
        </div>
    );
}
