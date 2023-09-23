import { FaHouse } from 'react-icons/fa6';
import { Link } from '@/view/layout';

export default function NotFound() {
    return (
        <main className="w-full h-full flex flex-row justify-center items-center">
            <div className="max-w-xl flex flex-col items-center gap-5">
                <h1 className="font-bold text-5xl">
                    Nenalezeno <small className="font-normal">(404)</small>
                </h1>
                <p>Tato stránka neexistuje.</p>

                <div className="flex flex-row w-full justify-center">
                    <Link href="/" className="inline-flex items-center bg-green-300">
                        Domů&emsp;
                        <FaHouse />
                    </Link>
                </div>
            </div>
        </main>
    );
}
