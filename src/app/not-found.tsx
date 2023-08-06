import { Anchor, Link } from '@/view/layout';
import { FaArrowLeftLong, FaHouse } from 'react-icons/fa6';

export default function NotFound() {
    return (
        <main className="w-full h-full flex flex-row justify-center items-center">
            <div className="max-w-xl flex flex-col items-center gap-5">
                <h1 className="font-bold text-5xl">Nenalezeno <small className="font-normal">(404)</small></h1>
                <p>Tato stránka neexistuje.</p>

                <div className="flex flex-row w-full justify-between">
                    <Anchor href="javascript:void history.back();" className="inline-flex items-center bg-green-300"><FaArrowLeftLong />&emsp;Zpět</Anchor>
                    <Link href="/" className="inline-flex items-center bg-green-300">Domů&emsp;<FaHouse /></Link>
                </div>
            </div>
        </main>
    );
}