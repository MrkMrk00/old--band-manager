import { Link } from '@/view/layout';
import { FaPlus } from 'react-icons/fa6';

export default function AdminBasePage() {
    return (
        <div className="w-full flex flex-col gap-2">
            <h2 className="text-xl">Nastavení aplikace</h2>
            <hr />
            <p>V seznamu vyber, co chceš nastavovat.</p>

            <div className="mt-5 flex flex-col gap-2 max-w-md">
                <h3 className="text-lg">Rychlé akce</h3>
                <hr />
                <Link href={`/admin/instruments/add?back_ref=${encodeURIComponent('/admin')}`} className="inline-flex flex-row items-center bg-green-400 text-white">
                    <FaPlus size="2em" />&emsp;Přidat nový nástroj
                </Link>
                <Link href={`/admin/instruments/add?t=groupings&back_ref=${encodeURIComponent('/admin')}`} className="inline-flex flex-row items-center bg-green-400 text-white">
                    <FaPlus size="2em" />&emsp;Přidat novou nástrojovou sekci
                </Link>
            </div>
        </div>
    );
}
