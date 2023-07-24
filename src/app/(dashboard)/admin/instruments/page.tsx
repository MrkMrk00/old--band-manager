import InstrumentList from '@/view/entity-list/InstrumentsList';
import { Link } from '@/view/layout';
import { FaPlus } from 'react-icons/fa6';
import InstrumentGroupingsList from '@/view/entity-list/InstrumentGroupingsList';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Nástroje',
};

export type EntityType = 'instruments' | 'groupings';

export default function InstrumentListPage({ searchParams }: { searchParams: { t?: EntityType } }) {
    if (searchParams.t === 'instruments') {
        redirect('/admin/instruments');
    }

    const type = searchParams.t ?? 'instruments';

    return (
        <div className="flex flex-col w-full items-center">
            <div className="w-full h-full max-w-2xl flex flex-col gap-5">
                <div className="flex flex-row w-full justify-between">
                    <div className="flex flex-row rounded-2xl shadow w-1/3 justify-between text-center">
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
                        &emsp;Přidat
                    </Link>
                </div>
                <div>
                    {type === 'instruments' && <InstrumentList />}

                    {type === 'groupings' && <InstrumentGroupingsList />}
                </div>
            </div>
        </div>
    );
}
