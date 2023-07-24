'use client';

import ListView, { type ListViewProps, type OnRowClickCallbackParameter } from '@/view/list';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import trpc from '@/lib/trcp/client';
import { If, LoadingSpinner } from '@/view/layout';

const headerMapping: ListViewProps<any>['headerMapping'] = {
    icon: { title: '' },
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
};

export default function InstrumentList() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = trpc.instruments.fetchAll.useQuery({ page });

    if (error) {
        console.error(error);
    }

    const objects = useMemo(() => {
        if (!data) {
            return [];
        }

        const mapped = new Array(data.payload.length);
        for (const { id, name, subname, created_at } of data.payload) {
            mapped.push({
                id,
                icon: ':)',
                name: `${name}${subname ? ` ${subname}` : ''}`,
                created_at: new Date(created_at).toLocaleString('cs'),
            });
        }

        return mapped;
    }, [data]);

    type TParam = OnRowClickCallbackParameter<AssertDefined<typeof objects>[0]>;
    function handleRowClick({ payload }: TParam) {
        router.push(`/admin/instruments/${payload.id}`);
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
                        only={['icon', 'name', 'created_at']}
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
