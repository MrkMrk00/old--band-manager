import { FaArrowLeftLong } from 'react-icons/fa6';
import { Link } from '@/view/layout';
import { redirect } from 'next/navigation';
import { EntityType } from '../page';
import InstrumentForm from '@/view/form/entity/instrument';
import GroupingForm from '@/view/form/entity/instrument_grouping';

export const metadata = {
    title: 'Přidej nástroj!',
};

type PageProps = {
    params: { id: string };
    searchParams: { t?: EntityType; back_ref?: string };
};

export default async function InstrumentView({ params: { id }, searchParams }: PageProps) {
    const type = searchParams.t ?? 'instruments';
    const backUrl = searchParams.back_ref ?? `/admin/instruments?t=${type}`;

    if ((id === '' || isNaN(+id)) && id !== 'add') {
        redirect(backUrl);
    }

    return (
        <div className="max-w-2xl w-full flex flex-col items-center gap-5">
            <div className="flex flex-row w-full">
                <Link
                    href={backUrl}
                    className="inline-flex flex-row justify-center items-center bg-green-300"
                >
                    <FaArrowLeftLong size="1em" />
                    &emsp;Zpět
                </Link>
            </div>
            {type === 'instruments' && (
                <InstrumentForm key="instruments" id={id as `${number}` | 'add'} />
            )}

            {type === 'groupings' && (
                <GroupingForm key="groupings" id={id as `${number}` | 'add'} />
            )}
        </div>
    );
}
