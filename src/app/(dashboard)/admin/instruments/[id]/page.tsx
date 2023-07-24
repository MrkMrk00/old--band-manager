import { FaArrowLeftLong } from 'react-icons/fa6';
import { Link } from '@/view/layout';
import { redirect } from 'next/navigation';
import { GroupingForm, InstrumentForm } from './client';
import { EntityType } from '../page';

type PageProps = {
    params: { id: string };
    searchParams: { t?: EntityType };
};

export default async function InstrumentView({ params: { id }, searchParams }: PageProps) {
    const type = searchParams.t ?? 'instruments';
    const backUrl = `/admin/instruments?t=${type}`;

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
