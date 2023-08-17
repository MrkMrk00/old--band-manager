import InstrumentsList from '@/view/list/entity/instruments';
import InstrumentGroupingsList from '@/view/list/entity/instrument_groupings';
import { Link } from '@/view/layout';
import { FaPlus } from 'react-icons/fa6';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Nástroje',
};

export type EntityType = 'instruments' | 'groupings';

type PageProps = {
    searchParams: { t?: EntityType; refetch?: string };
};

export default function InstrumentListPage({ searchParams }: PageProps) {
    if (searchParams.t === 'instruments') {
        redirect('/admin/instruments');
    }

    const type = searchParams.t ?? 'instruments';
    const refetch = !searchParams.refetch ? false : +searchParams.refetch === 1;

    return (
        <div className="flex flex-col w-full items-center">
            <div className="w-full h-full max-w-2xl flex flex-col gap-5">
                <div className="flex flex-row w-full justify-between">
                    <div className="flex flex-row rounded-2xl shadow md:w-1/3 w-1/2 justify-between text-center">
                        <Link
                            className={`rounded-r-none shadow-none border-r w-full${
                                type === 'instruments' ? ' bg-slate-200' : ''
                            }`}
                            href="/admin/instruments"
                        >
                            Nástroje
                        </Link>
                        <Link
                            className={`rounded-l-none shadow-none w-full${
                                type === 'groupings' ? ' bg-slate-200' : ''
                            }`}
                            href="/admin/instruments?t=groupings"
                        >
                            Sekce
                        </Link>
                    </div>

                    <Link
                        href={`/admin/instruments/add?t=${type}`}
                        className="inline-flex items-center bg-green-300"
                    >
                        <FaPlus />
                        &nbsp;Přidat
                    </Link>
                </div>
                <div className="whitespace-nowrap">
                    {type === 'instruments' && <InstrumentsList refetch={refetch} />}

                    {type === 'groupings' && <InstrumentGroupingsList refetch={refetch} />}
                </div>
            </div>
        </div>
    );
}
