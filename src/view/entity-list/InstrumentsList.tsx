'use client';

import type { RowClickCallbackEvent, HeaderMapping, ObjectType } from '@/view/list';
import type { InstrumentGrouping } from '@/model/instrument_groupings';

import { ListView, Pager } from '@/view/list';
import { type ReactNode, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { If, LoadingSpinner } from '@/view/layout';
import trpc from '@/lib/trcp/client';

const headerMapping = {
    icon: { title: '', className: 'w-1/4' },
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
    groupings: { title: 'Sekce' },
} satisfies HeaderMapping<ObjectType>;

function renderGroupings(groupings: InstrumentGrouping[]): ReactNode {
    return (
        <div className="flex flex-row">
            {groupings.map(g =>
                <small className="rounded-2xl h-[1em] bg-yellow-300 p-2 inline-flex justify-center items-center" key={g.id}>
                    {g.name.at(0)}
                </small>
            )}
        </div>
    );
}

export default function InstrumentList() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = trpc.instruments.fetchAll.useQuery({ page, perPage: 5 });
    const { data: allGroupings } = trpc.instruments.groupings.fetchAll.useQuery({ perPage: Number.MAX_SAFE_INTEGER });

    if (error) {
        console.error(error);
    }

    const objects = useMemo(() => {
        if (!data || data.payload.length === 0) {
            return [];
        }

        const objects = new Array(data.payload.length);
        let at = 0;
        for (let obj of data.payload) {
            const { id, name, subname, created_at, groupings } = obj;
            const includeGroupings = allGroupings?.payload.filter(({ id }) => groupings.includes(id));

            objects[at] = {
                id,
                name: `${name}${subname ? ' ' + subname : ''}`,
                created_at: new Date(created_at).toLocaleString('cs'),
                icon: ':)',
                groupings: includeGroupings ? renderGroupings(includeGroupings) : '',
            };

            at++;
        }

        return objects;
    }, [data, allGroupings]);

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
                        only={['icon', 'name', 'groupings', 'created_at']}
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
