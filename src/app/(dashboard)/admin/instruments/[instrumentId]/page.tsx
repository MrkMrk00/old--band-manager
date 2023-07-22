import { FaArrowLeftLong } from 'react-icons/fa6';
import { Link } from '@/view/layout';
import { redirect } from 'next/navigation';
import InstrumentForm from './client';

export default async function InstrumentView({
    params: { instrumentId },
}: {
    params: { instrumentId: string };
}) {
    if ((instrumentId === '' || isNaN(+instrumentId)) && instrumentId !== 'add') {
        redirect('/admin/instruments');
    }

    return (
        <div className="max-w-2xl w-full flex flex-col items-center gap-5">
            <div className="flex flex-row w-full">
                <Link
                    href="/admin/instruments"
                    className="inline-flex flex-row justify-center items-center bg-green-300"
                >
                    <FaArrowLeftLong size="1em" />
                    &emsp;Zpět
                </Link>
            </div>
            <InstrumentForm instrumentId={instrumentId as `${number}` | 'add'} />
        </div>
    );
}
