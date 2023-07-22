import InstrumentList from './client';
import { Link } from '@/view/layout';
import { FaPlus } from 'react-icons/fa6';

export const metadata = {
    title: 'Nástroje',
};

export default function InstrumentListPage() {
    return (
        <div className="flex flex-col w-full items-center">
            <div className="w-full max-w-2xl flex flex-col gap-5">
                <div className="flex flex-row w-full justify-end">
                    <Link
                        href="/admin/instruments/add"
                        className="inline-flex items-center bg-green-300"
                    >
                        <FaPlus />
                        &emsp;Přidat
                    </Link>
                </div>

                <InstrumentList />
            </div>
        </div>
    );
}
