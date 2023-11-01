import { FaArrowLeftLong, FaPlus } from 'react-icons/fa6';
import 'server-only';
import type { Database } from '@/database';
import { admin } from '@/lib/route-register';
import { AdminList } from '@/view/admin/list';
import InstrumentsList from '@/view/admin/list/instruments';
import UsersList from '@/view/admin/list/users';
import pages from '@/view/admin/page';
import SongsPage from '@/view/admin/pages/songs';
import { Link } from '@/view/layout';
import t from '@/i18n/translator';

const views = {
    users: {
        list: UsersList,
    },
    songs: {
        page: SongsPage,
    },
    instruments: {
        list: InstrumentsList,
    },
} as const;

type PageProps = {
    params: {
        entity: string;
    };
    searchParams: {
        show?: string;
        back_ref?: string;
        page?: string;
        refetch?: string;
    };
};

export default async function EntityListView({ params, searchParams }: PageProps) {
    const entity = params.entity.replace('-', '_');
    let { show, back_ref, refetch: _refetch, page: _page } = searchParams;

    if (typeof show === 'undefined' || (show !== 'list' && show !== 'page')) {
        show = 'list';
    }

    const refetch = !!_refetch;
    const page = _page && _page !== '' ? +_page : 1;

    const Page = entity in pages ? pages[entity as keyof typeof pages] : null;

    if (Page !== null && show !== 'list') {
        return <Page />;
    }

    return (
        <div className="flex flex-col w-full items-center">
            <div className="w-full h-full max-w-2xl flex flex-col gap-5">
                <div className="flex flex-row w-full justify-between items-center">
                    <div className="flex flex-row items-center gap-4">
                        {back_ref && (
                            <Link href={back_ref} className="inline-flex items-center bg-green-300">
                                <FaArrowLeftLong />
                                &nbsp;{t('cs', 'nav', 'back', 'ucfirst')}
                            </Link>
                        )}
                        <h2 className="text-2xl font-bold">
                            {t('cs', 'entity', entity, 'ucfirst')}
                        </h2>
                    </div>
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
                {entity === 'users' ? (
                    <UsersList page={page ? +page : 1} refetch={!!refetch} />
                ) : (
                    <AdminList entity={entity}></AdminList>
                )}
            </div>
        </div>
    );
}
