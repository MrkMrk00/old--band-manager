import { AdminList } from './list';
import { FaPlus } from 'react-icons/fa6';
import type { Database } from '@/database';
import { admin } from '@/lib/route-register';
import { Link } from '@/view/layout';
import t from '@/i18n/translator';

type PageProps = {
    params: {
        entity: string;
    };
};

export default async function EntityListView({ params }: PageProps) {
    let { entity } = params;
    entity = entity.replace('-', '_');

    return (
        <div className="flex flex-col w-full items-center">
            <div className="w-full h-full max-w-2xl flex flex-col gap-5">
                <div className="flex flex-row w-full justify-between items-center">
                    <h2 className="text-2xl font-bold">{t('cs', 'entity', entity, 'ucfirst')}</h2>
                    <Link
                        href={admin()
                            .add(entity as keyof Database)
                            .build()}
                        className="inline-flex items-center bg-green-300"
                    >
                        <FaPlus />
                        &nbsp;Přidat
                    </Link>
                </div>
                <hr />

                <AdminList entity={entity}></AdminList>
            </div>
        </div>
    );
}
