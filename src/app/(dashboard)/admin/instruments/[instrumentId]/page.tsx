import { FaArrowLeftLong } from 'react-icons/fa6';
import { Link } from '@/view/layout';
import { InstrumentsRepository } from '@/lib/repositories';
import { Instrument } from '@/model/instruments';
import { redirect } from 'next/navigation';

export default async function InstrumentView({
    params: { instrumentId },
}: {
    params: { instrumentId: string };
}) {
    let instrument: Instrument | null = null;

    if (instrumentId !== '' && !isNaN(+instrumentId)) {
        instrument = await InstrumentsRepository.findById(+instrumentId);
    }

    if (!instrument) {
        redirect('/admin/instruments');
    }

    return (
        <div className="flex flex-row gap-2">
            <aside>
                <Link
                    href="/admin/instruments"
                    className="inline-flex flex-row justify-center items-center bg-green-300"
                >
                    <FaArrowLeftLong size="1em" />
                    &emsp;Zpět
                </Link>
            </aside>
            <div>Tady bude nástroj</div>
        </div>
    );
}
