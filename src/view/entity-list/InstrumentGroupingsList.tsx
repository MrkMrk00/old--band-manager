'use client';

import ListView, { type ListViewProps, type OnRowClickCallbackParameter } from '@/view/list';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { If, LoadingSpinner } from '@/view/layout';
import trpc from '@/lib/trcp/client';

const headerMapping: ListViewProps<any>['headerMapping'] = {
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
    admin_name: { title: 'Přidal admin' },
};

export default function InstrumentGroupingsList() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = trpc.instruments.groupings.fetchAll.useQuery({ page });

    const objects = useMemo(() => {
        if (!data) {
            return [];
        }

        const mapped = new Array(data.payload.length);
        for (const { id, name, created_at, admin_name } of data.payload) {
            mapped.push({
                id,
                name,
                created_at: new Date(created_at).toLocaleString('cs'),
                admin_name: !admin_name ? '' : admin_name.split(' ')[0],
            });
        }

        return mapped;
    }, [data]);

    if (error) {
        console.error(error);
    }

    type TParam = OnRowClickCallbackParameter<AssertDefined<typeof objects>[0]>;
    function handleRowClick({ payload }: TParam) {
        router.push(`/admin/instruments/${payload.id}?t=groupings`);
    }

    return (
        <>
            <If condition={isLoading}>
                <div className="w-full h-full p-4 rounded-xl shadow flex flex-row justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {data && (
                <>
                    <ListView
                        className="rounded-xl shadow w-full h-full text-center"
                        headerClassName="bg-slate-100 font-bold"
                        objects={objects}
                        onRowClick={handleRowClick}
                        only={['name', 'created_at', 'admin_name']}
                        headerMapping={headerMapping}
                    />

                    <If condition={data.maxPage > 1}>
                        <div className="flex flex-row">
                            <ListView.Pager
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
