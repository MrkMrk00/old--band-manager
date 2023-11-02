'use client';

import { Button, Link } from '@/view/layout';
import { FaHouse, FaRepeat } from 'react-icons/fa6';

type HandlerProps = {
    reset: () => void;
    error: Error;
};

export default function GlobalErrorHandler({ reset, error }: HandlerProps) {
    return (
        <html>
            <body>
                <main className="w-full h-full flex flex-row justify-center items-center">
                    <div className="max-w-xl flex flex-col items-center gap-5">
                        <h1 className="font-bold text-5xl">
                            Čas dát si kávu ☕
                            <small className="font-normal">({error.name.slice(0, 10)})</small>
                        </h1>
                        <pre>{error.message}</pre>

                        <div className="flex flex-row w-full justify-between">
                            <Button
                                type="button"
                                onClick={reset}
                                className="inline-flex items-center bg-green-300"
                            >
                                <FaRepeat />
                                &emsp;Zkusit znovu
                            </Button>
                            <Link href="/" className="inline-flex items-center bg-green-300">
                                Domů&emsp;
                                <FaHouse />
                            </Link>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
