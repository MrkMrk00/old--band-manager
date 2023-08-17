import { FaPlus } from 'react-icons/fa6';
import { Link } from '@/view/layout';
import { AdminList } from './list';

type PageProps = {
    params: {
        entity: string;
    },
};

export default async function EntityListView({ params }: PageProps) {
    const { entity } = params;

    return (
        <div className="flex flex-col w-full items-center">
            <div className="w-full h-full max-w-2xl flex flex-col gap-5">
                <div className="flex flex-row w-full justify-between">
                    <Link
                        href={`/admin/${entity}/add`}
                        className="inline-flex items-center bg-green-300"
                    >
                        <FaPlus />
                        &nbsp;Přidat
                    </Link>
                </div>

                <AdminList entity={entity}></AdminList>
            </div>
        </div>
    );
}