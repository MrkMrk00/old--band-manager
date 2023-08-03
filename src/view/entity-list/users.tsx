'use client';

import trpc from '@/lib/trcp/client';
import { useState } from 'react';
import { If, LoadingSpinner } from '@/view/layout';
import { HeaderMapping, ListView, ObjectType, Pager } from '@/view/list';

const headerMapping: HeaderMapping<ObjectType> = {

};

export default function UsersList({ refetch: forceRefetch }: { refetch?: boolean }) {
    const [page, setPage] = useState(1);
    const { data, error, refetch } = trpc.users.fetchAll.useQuery({ page });

    if (forceRefetch) {
        void refetch();
    }

    const objects = data?.payload;
    debugger;

    return (
        <>
            <If condition={!data}>
                <div className="w-full h-full p-4 rounded-xl shadow flex flex-row justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {data && objects && (
                <>
                    <ListView
                        objects={objects}
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