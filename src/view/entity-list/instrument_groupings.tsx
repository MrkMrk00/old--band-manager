'use client';

import type { RowClickCallbackEvent, HeaderMapping, ObjectType } from '@/view/list';

import { ListView, Pager } from '@/view/list';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { If, LoadingSpinner } from '@/view/layout';
import trpc from '@/lib/trcp/client';

const headerMapping = {
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
    admin_name: { title: 'Přidal admin' },
} satisfies HeaderMapping<ObjectType>;

export default function InstrumentGroupingsList({ refetch: forceRefetch }: { refetch?: boolean }) {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const { data, isLoading, error, refetch } = trpc.instruments.groupings.fetchAll.useQuery({
        page,
    });

    if (forceRefetch) {
        void refetch();
    }

    const objects = useMemo(() => {
        if (!data) {
            return [];
        }

        const mapped = new Array(data.payload.length);
        let at = 0;
        for (const { id, name, created_at, admin_name } of data.payload) {
            mapped[at] = {
                id,
                name,
                created_at: new Date(created_at).toLocaleString('cs'),
                admin_name: !admin_name ? '' : admin_name.split(' ')[0],
            };

            at++;
        }

        return mapped;
    }, [data]);

    if (error) {
        console.error(error);
    }

    function handleRowClick(ev: RowClickCallbackEvent) {
        router.push(`/admin/instruments/${ev.currentTarget.dataset.objectId}?t=groupings`);
    }

    return (
        <>
            <If condition={isLoading}>
                <div className="w-full h-full p-4 rounded-xl shadow flex flex-row justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {data && objects && (
                <>
                    <ListView
                        objects={objects}
                        onRowClick={handleRowClick}
                        only={['name', 'created_at', 'admin_name']}
                        headerMapping={headerMapping}
                    />

                    <If condition={data.maxPage > 1}>
                        <div className="flex flex-row">
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
