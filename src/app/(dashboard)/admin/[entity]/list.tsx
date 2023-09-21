'use client';

import type { RowClickCallbackEvent } from '@/view/list/list-generic';
import {
    useInstrumentGroupingsList,
    useInstrumentsList,
    useUsersList,
} from '@/view/admin/list-hooks';
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { If, LoadingSpinner } from '@/view/layout';
import { ListView, Pager } from '@/view/list';
import { instrument, instrumentGrouping, user } from '@/view/admin/headerMapping';
import Logger from '@/lib/logger';
import {admin} from "@/lib/route-register";
import {Database} from "@/database";

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
    const pathname = usePathname();
    const logger = Logger.fromEnv();

    const dataProvider =
        entity in dataProviders ? dataProviders[entity as keyof typeof dataProviders] : null;

    if (!dataProvider) {
        logger.notice('AdminList :: Unknown entity type', {
            entity,
            pathname,
            searchParams: searchParams.toString(),
        });

        redirect('/admin?err_str=' + encodeURIComponent(`Neznámá entita: ${entity}!`));
    }

    const [headerMapping, dataHook] = dataProvider;
    const { isLoading, page, setPage, maxPage, refetch, error, objects } = dataHook();

    if (searchParams.get('refetch')) {
        refetch();
        router.push(pathname.replace(/(refetch=[^&]+&?)/, ''));
    }

    if (error) {
    }

    function handleRowClick(ev: RowClickCallbackEvent) {
        router.push(admin().show(entity as keyof Database, ev.currentTarget.dataset.objectId).build());
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

                    {!!maxPage && maxPage > 1 && (
                        <div className="flex flex-row pt-5">
                            <Pager
                                maxPage={maxPage!}
                                curPage={page}
                                onPageChange={num => setPage(num)}
                                btnClassName="bg-white"
                            />
                        </div>
                    )}
                </>
            )}
        </>
    );
}
