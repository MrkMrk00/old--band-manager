'use client';

import type { RowClickCallbackEvent, HeaderMapping, ObjectType } from '@/view/list';

import { ListView, Pager } from '@/view/list';
import { useRouter } from 'next/navigation';
import { If, LoadingSpinner } from '@/view/layout';
import { useInstrumentGroupingsList } from '@/view/list/hooks';

const headerMapping = {
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
    admin_name: { title: 'Přidal admin' },
} satisfies HeaderMapping<ObjectType>;

export default function InstrumentGroupingsList({ refetch: forceRefetch }: { refetch?: boolean }) {
    const router = useRouter();
    const { refetch, error, isLoading, groupings, setPage, page, maxPage } =
        useInstrumentGroupingsList();

    if (forceRefetch) {
        void refetch();
    }

    if (error) {
        console.error(error);
    }

    function handleRowClick(ev: RowClickCallbackEvent) {
        router.push(`/admin/instruments/${ev.currentTarget.dataset.objectId}?t=groupings`);
    }

    return (
        <>
            <If condition={isLoading}>
                <div className="w-full h-full flex justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {groupings && (
                <>
                    <ListView
                        objects={groupings}
                        onRowClick={handleRowClick}
                        headerMapping={headerMapping}
                    />

                    <If condition={!!maxPage && maxPage > 1}>
                        <div className="flex flex-row">
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
