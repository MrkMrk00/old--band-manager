'use client';

import trpc from '@/lib/trcp/client';
import { useMemo, useState } from 'react';
import { If, LoadingSpinner } from '@/view/layout';
import { HeaderMapping, ListView, ObjectType, Pager, RowClickCallbackEvent } from '@/view/list';
import { FaAt, FaFacebook } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

const headerMapping: HeaderMapping<ObjectType> = {
    display_name: { title: 'Přezdívka', className: 'max-w-1/4' },
    login: { title: '', className: 'max-w-1/8' },
    created_at: { title: 'Zaregistrován', className: 'max-w-1/4' },
    roles: { title: 'Role', className: 'max-w-3/8 text-sm group-[.header]:text-base' },
};

export default function UsersList({ refetch: forceRefetch }: { refetch?: boolean }) {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const { data, error, refetch } = trpc.users.fetchAll.useQuery({ page });

    if (forceRefetch) {
        void refetch();
    }

    function handleNavigate(ev: RowClickCallbackEvent) {
        router.push(`/admin/users/${ev.currentTarget.dataset.objectId}`);
    }

    const objects = useMemo(() => {
        if (!data?.payload.length) {
            return [];
        }

        const objs = new Array(data.payload.length);
        let at = 0;
        for (const { id, display_name, created_at, fb_id, email, roles } of data.payload) {
            objs[at] = {
                id,
                display_name,
                login: (
                    <div className="inline-flex flex-row justify-center items-center gap-2">
                        { fb_id && <FaFacebook title="Facebook" className="text-blue-600" size="1.5em" /> }
                        { email && <FaAt title="E-mail" size="1.5em" /> }
                    </div>
                ),
                created_at: new Date(created_at).toLocaleDateString('cs'),
                roles: roles.join(', '),
            };
        }

        return objs;
    }, [data]);

    return (
        <>
            <If condition={!data}>
                <div className="w-full h-full flex justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {data && objects && (
                <>
                    <ListView
                        objects={objects}
                        onRowClick={handleNavigate}
                        headerMapping={headerMapping}
                    />

                    <If condition={data.maxPage > 1}>
                        <div className="flex flex-row pt-5">
                            <Pager
                                maxPage={data.maxPage}
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