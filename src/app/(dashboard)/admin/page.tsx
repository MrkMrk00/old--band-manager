import type { Metadata } from 'next';
import { Link } from '@/view/layout';
import { FaPlus } from 'react-icons/fa6';
import { admin } from '@/lib/route-register';

export const metadata: Metadata = {
    title: 'Nastavení aplikace',
};

type PageProps = {
    searchParams: {
        err_str?: string[] | string;
    };
};

export default function AdminBasePage({ searchParams }: PageProps) {
    const errStr =
        typeof searchParams.err_str === 'string' ? [searchParams.err_str] : searchParams.err_str;

    return (
        <div className="w-full flex flex-col gap-2">
            <h2 className="text-xl">Nastavení aplikace</h2>
            <hr />
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-between w-full">
                <p className="w-full">
                    V seznamu <span className="hidden md:inline-block">vlevo</span>
                    <span className="inline-block md:hidden">nahoře</span> vyber, co chceš
                    nastavovat.
                </p>
                {errStr && (
                    <div className="w-full">
                        <h3 className="font-bold text-red-500 text-xl">Chyby:</h3>
                        <ul className="pl-4">
                            {errStr.map(e => (
                                <li key={e} className="text-red-500">
                                    {e}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mt-5 flex flex-col gap-2 max-w-md">
                <h3 className="text-lg">Rychlé akce</h3>
                <hr />
                <Link
                    href={admin().add('instruments').setBackRef('/admin').build()}
                    className="inline-flex flex-row items-center bg-green-300"
                >
                    <FaPlus size="2em" />
                    &emsp;Přidat nový nástroj
                </Link>
                <Link
                    href={admin().add('instrument_groupings').setBackRef('/admin').build()}
                    className="inline-flex flex-row items-center bg-green-300"
                >
                    <FaPlus size="2em" />
                    &emsp;Přidat novou nástrojovou sekci
                </Link>
            </div>
        </div>
    );
}
