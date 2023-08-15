'use client';

import { If, LoadingSpinner } from '@/view/layout';
import {
    type HeaderMapping,
    ListView,
    ObjectType,
    Pager,
    type RowClickCallbackEvent,
} from '@/view/list';
import { useRouter } from 'next/navigation';
import { useUsersList } from '@/view/list/hooks';

const headerMapping: HeaderMapping<ObjectType> = {
    display_name: { title: 'Přezdívka', className: 'max-w-1/4' },
    login: { title: '', className: 'max-w-1/8' },
    created_at: { title: 'Zaregistrován', className: 'max-w-1/4' },
    roles: { title: 'Role', className: 'max-w-3/8 text-sm group-[.header]:text-base' },
};

export default function UsersList({ refetch: forceRefetch }: { refetch?: boolean }) {
    const router = useRouter();
    const { refetch, users, isLoading, page, setPage, maxPage } = useUsersList();

    if (forceRefetch) {
        void refetch();
    }

    function handleNavigate(ev: RowClickCallbackEvent) {
        router.push(`/admin/users/${ev.currentTarget.dataset.objectId}`);
    }

    return (
        <>
            <If condition={isLoading}>
                <div className="w-full h-full flex justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {users && (
                <>
                    <ListView
                        objects={users}
                        onRowClick={handleNavigate}
                        headerMapping={headerMapping}
                    />

                    <If condition={maxPage > 1}>
                        <div className="flex flex-row pt-5">
                            <Pager
                                maxPage={maxPage}
                                curPage={page}
                                onPageChange={num => setPage(num)}
                                btnClassName="bg-white"
                            />
                        </div>
                    </If>
                </>
            )}
        </>
    );
}
