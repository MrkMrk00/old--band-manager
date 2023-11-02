import { admin } from '@/lib/route-register';
import { Link as LayoutLink } from '@/view/layout';
import type { ComponentProps } from 'react';
import { FaList } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

function Link({ className, ...props }: ComponentProps<typeof LayoutLink>) {
    return (
        <LayoutLink
            {...props}
            className={twMerge(
                'inline-flex flex-row items-center bg-green-300 h-[48px]',
                className,
            )}
        />
    );
}

const selfRoute = admin().page('songs').build();

export default function SongsPage() {
    return (
        <div className="w-full h-full">
            <h1 className="text-xl">Skladby</h1>
            <hr />

            <div className="flex flex-col gap-2 py-2 max-w-sm">
                <Link href={admin().list('songs').setBackRef(selfRoute).build()}>
                    <FaList size="1.5em" />
                    &emsp;Zobrazit všechny&nbsp;<strong>skladby</strong>
                </Link>
                <Link href={admin().list('sheets').setBackRef(selfRoute).build()}>
                    <FaList size="1.5em" />
                    &emsp;Zobrazit všechny&nbsp;<strong>noty</strong>
                </Link>
            </div>
        </div>
    );
}
