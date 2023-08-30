'use client';

import type { RowClickCallbackEvent } from '@/view/list/list-generic';
import {
    useInstrumentGroupingsList,
    useInstrumentsList,
    useUsersList,
} from '@/view/admin/list-hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { If, LoadingSpinner } from '@/view/layout';
import { ListView, Pager } from '@/view/list';
import { instrument, instrumentGrouping, user } from '@/view/admin/headerMapping';

type ListProps = {
    entity: string;
};

const dataProviders = {
    instruments: [instrument, useInstrumentsList],
    instrument_groupings: [instrumentGrouping, useInstrumentGroupingsList],
    users: [user, useUsersList],
} as const;

export function AdminList({ entity }: ListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const dataProvider =
        entity in dataProviders ? dataProviders[entity as keyof typeof dataProviders] : null;
    if (!dataProvider) {
        throw new Error('Unknown entity type');
    }

    const [headerMapping, dataHook] = dataProvider;
    const { isLoading, page, setPage, maxPage, refetch, error, objects } = dataHook();

    if (searchParams.get('refetch')) {
        void refetch();
    }

    if (error) {
        console.error(error);
    }

    function handleRowClick(ev: RowClickCallbackEvent) {
        router.push(`/admin/${entity}/${ev.currentTarget.dataset.objectId}`);
    }

    return (
        <>
            <If condition={isLoading}>
                <div className="w-full h-full flex justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {!isLoading && (
                <>
                    <ListView
                        objects={objects}
                        onRowClick={handleRowClick}
                        headerMapping={headerMapping}
                    />

                    <If condition={maxPage ? maxPage > 1 : false}>
                        <div className="flex flex-row pt-5">
                            <Pager
                                maxPage={maxPage!}
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
