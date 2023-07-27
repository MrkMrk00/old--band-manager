'use client';

import type { RowClickCallbackEvent, HeaderMapping, ObjectType } from '@/view/list';

import { ListView, Pager } from '@/view/list';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { If, LoadingSpinner } from '@/view/layout';
import trpc from '@/lib/trcp/client';

const headerMapping = {
    icon: { title: '', className: 'w-1/4' },
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
} satisfies HeaderMapping<ObjectType>;

export default function InstrumentList() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = trpc.instruments.fetchAll.useQuery({ page, perPage: 5 });

    if (error) {
        console.error(error);
    }

    const objects = useMemo(() => {
        if (!data || data.payload.length === 0) {
            return [];
        }

        const objects = new Array(data.payload.length);
        let at = 0;
        for (const { id, name, subname, created_at, icon } of data.payload) {
            objects[at] = {
                id,
                name: `${name}${subname ? ' ' + subname : ''}`,
                created_at: new Date(created_at).toLocaleString('cs'),
                icon: ':)',
            };

            at++;
        }

        return objects;
    }, [data]);

    function handleRowClick(ev: RowClickCallbackEvent) {
        router.push(`/admin/instruments/${ev.currentTarget.dataset.objectId}`);
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
                        only={['icon', 'name', 'created_at']}
                        headerMapping={headerMapping}
                    />

                    <If condition={data.maxPage > 1}>
                        <div className="flex flex-row pt-5">
                            <Pager
                                maxPage={data.maxPage}
                                curPage={data.page}
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
