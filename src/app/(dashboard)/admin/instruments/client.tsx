'use client';

import { ListView, type ListViewProps, type OnRowClickCallbackParameter } from '@/view/list';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import trpc from '@/lib/trcp/client';
import toast from 'react-hot-toast';
import { FaFaceSmile } from 'react-icons/fa6';
import { If, LoadingSpinner } from '@/view/layout';

const headerMapping: ListViewProps<any>['headerMapping'] = {
    icon: { title: '' },
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
};

export default function ClientPage() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = trpc.instruments.fetchAll.useQuery({ page });

    if (isError) {
        toast.error('Nepodařilo se načíst nástroje :(');
    }

    const objects = data?.map(({ id, name, subname, created_at }) => {
        return {
            id,
            icon: <FaFaceSmile size="1em" />,
            name: `${name}${subname ? ` ${subname}` : ''}`,
            created_at: new Date(created_at).toLocaleString('cs'),
        };
    });

    function handleRowClick({ payload }: OnRowClickCallbackParameter<Defined<typeof objects>[0]>) {
        router.push(`/admin/instruments/${payload.id}`);
    }

    return (
        <div className="flex flex-row w-100 justify-center">
            <If condition={isLoading}>
                <div className="max-w-lg w-full h-[200px] rounded-xl shadow flex flex-row justify-center items-center">
                    <LoadingSpinner size="4em" color="black" />
                </div>
            </If>

            {objects && (
                <ListView
                    className="max-w-lg rounded-xl shadow w-full h-full text-center"
                    headerClassName="bg-slate-50"
                    objects={objects}
                    onRowClick={handleRowClick}
                    only={['icon', 'name', 'created_at']}
                    headerMapping={headerMapping}
                />
            )}
        </div>
    );
}