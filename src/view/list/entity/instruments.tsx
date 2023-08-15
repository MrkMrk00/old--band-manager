'use client';

import type { RowClickCallbackEvent, HeaderMapping, ObjectType } from '@/view/list';
import { ListView, Pager } from '@/view/list';
import { useRouter } from 'next/navigation';
import { If, LoadingSpinner } from '@/view/layout';
import { useInstrumentsList } from '@/view/list/hooks';

const headerMapping = {
    icon: { title: '', className: 'w-1/4' },
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
    groupings: { title: 'Sekce' },
} satisfies HeaderMapping<ObjectType>;

export default function InstrumentsList({ refetch: forceRefetch }: { refetch?: boolean }) {
    const router = useRouter();
    const { maxPage, instruments, refetch, error, page, setPage, isLoading } = useInstrumentsList();

    if (forceRefetch) {
        void refetch();
    }

    if (error) {
        console.error(error);
    }

    function handleRowClick(ev: RowClickCallbackEvent) {
        router.push(`/admin/instruments/${ev.currentTarget.dataset.objectId}`);
    }

    return (
        <>
            <If condition={isLoading}>
                <div className="w-full h-full flex justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {instruments && (
                <>
                    <ListView
                        objects={instruments}
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
