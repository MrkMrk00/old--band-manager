import 'server-only';

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { FaArrowLeftLong, FaPlus } from 'react-icons/fa6';

import type { Database } from '@/database';
import t from '@/i18n/translator';
import { admin } from '@/lib/route-register';
import type { ListProps } from '@/view/admin/list/common';
import { Link } from '@/view/layout';

import InstrumentsList from '@/view/admin/list/instruments';
import GroupingsList from '@/view/admin/list/instrument-groupings';
import UsersList from '@/view/admin/list/users';
import SongsPage from '@/view/admin/pages/songs';
import ReloadButton from './reload-button';

const ViewType = {
    list: 'list',
    page: 'page',
} as const;

type ViewType = keyof typeof ViewType;

type ListElement = (props: ListProps) => Promise<ReactNode> | ReactNode;
type PageElement = () => Promise<ReactNode> | ReactNode;

type ViewsDef = {
    [key in keyof Database]?: {
        list?: ListElement;
        page?: PageElement;
    };
};

const Views: ViewsDef = {
    users: {
        list: UsersList,
    },
    songs: {
        page: SongsPage,
    },
    instruments: {
        list: InstrumentsList,
    },
    instrument_groupings: {
        list: GroupingsList,
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
        no_add?: string;
    };
};

function notFound(what: string): void {
    redirect(admin().pushError(`Nenalezeno: ${what}`).build());
}

export default async function EntityListView({ params, searchParams: search }: PageProps) {
    const entity = params.entity.replace('-', '_') as keyof typeof Views;

    let show: ViewType = ViewType.page;
    if (typeof search.show === 'string' && search.show in ViewType) {
        show = search.show as ViewType;
    }

    const refetch = !!search.refetch;
    const page = search.page && search.page !== '' ? +search.page : 1;

    if (!(entity in Views)) {
        notFound(`${entity}`);
    }

    let view = Views[entity]![show];

    const Page: PageElement | undefined = show === 'page' ? (view as PageElement) : undefined;
    if (show === 'page' && typeof Page === 'undefined') {
        show = 'list';
        view = Views[entity]!.list;
    }

    const List: ListElement | undefined = show === 'list' ? (view as ListElement) : undefined;

    return (
        <div className="flex flex-col w-full items-center">
            {show === 'list' && (
                <div className="w-full max-w-2xl flex flex-col gap-5 mb-3">
                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="flex flex-row items-center gap-4">
                            {search.back_ref && (
                                <Link
                                    href={search.back_ref}
                                    className="inline-flex items-center bg-green-300"
                                >
                                    <FaArrowLeftLong />
                                    &nbsp;{t('cs', 'nav', 'back', 'ucfirst')}
                                </Link>
                            )}
                            <h2 className="text-2xl font-bold">
                                {t('cs', 'entity', entity, 'ucfirst')}
                            </h2>
                        </div>
                        <div className="flex flex-row h-full gap-2">
                            <ReloadButton />
                            {!search.no_add && (
                                <Link
                                    href={admin()
                                        .add(entity as keyof Database)
                                        .build()}
                                    className="inline-flex items-center bg-green-300"
                                >
                                    <FaPlus />
                                    &nbsp;Přidat
                                </Link>
                            )}
                        </div>
                    </div>
                    <hr />
                </div>
            )}
            {List && <List page={page} refetch={refetch} />}

            {Page && <Page />}
        </div>
    );
}
