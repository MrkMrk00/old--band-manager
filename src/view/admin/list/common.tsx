import { redirect } from 'next/navigation';
import type { AnchorHTMLAttributes } from 'react';
import { FaLeftLong, FaRightLong } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import { Database } from '@/database';
import env from '@/env.mjs';
import getRepositoryFor from '@/lib/repositories';
import { admin } from '@/lib/route-register';
import { Link } from '@/view/layout';

export type ListProps = {
    refetch: boolean;
    page: number;
};

function PagerButton(
    props: AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean; href: string },
) {
    const { className, children, disabled, ...restProps } = props;

    return (
        <Link
            {...restProps}
            className={twMerge(
                'w-full h-full px-4 py-2 border inline-flex justify-center items-center transition-all rounded-none shadow-none',
                className,
                disabled ? 'pointer-events-none brightness-95' : 'hover:brightness-90',
            )}
        >
            {children}
        </Link>
    );
}

export type PagerProps = {
    maxPage: number;
    page: number;
    className?: string;
    btnClassName?: string;
    href: URL;
};

export function Pager(props: PagerProps) {
    const { maxPage, page, className, btnClassName, href, ...divProps } = props;

    if (page === maxPage) {
        return <span data-pager="not-needed" />;
    }

    if (page < maxPage) {
        href.searchParams.set('page', String(page + 1));
    } else {
        href.searchParams.set('page', String(page));
    }
    const nextHref = href.toString();

    if (page > 0) {
        href.searchParams.set('page', String(page - 1));
    } else {
        href.searchParams.set('page', String(page));
    }
    const prevHref = href.toString();

    return (
        <div
            {...divProps}
            className={twMerge(
                'flex flex-row rounded-xl items-center bg-white max-w-sm w-full',
                className,
            )}
        >
            <PagerButton
                disabled={page === 1}
                className="rounded-none shadow-none rounded-l-xl bg-inherit"
                href={prevHref}
            >
                {page > 1 ? <FaLeftLong /> : <span className="w-[1em] h-[1em]"></span>}
            </PagerButton>
            <div className="px-4 py-2 h-full w-full text-center border-y bg-inherit whitespace-nowrap">
                <span className="font-bold">{page} </span>
                <small>z {maxPage}</small>
            </div>
            <PagerButton
                className="rounded-r-xl bg-inherit"
                disabled={page === maxPage}
                href={nextHref}
            >
                {page < maxPage ? <FaRightLong /> : <span className="w-[1em] h-[1em]"></span>}
            </PagerButton>
        </div>
    );
}

export function getListUtils<Key extends keyof Database>(
    entity: Key,
    page: number,
    refetch: boolean,
) {
    if (refetch) {
        redirect(admin().list('users').addSearchParam('page', page.toString()).build());
    }

    const route = admin().list(entity);
    const url = new URL(route.build(), env.NEXT_PUBLIC_DOMAIN);

    return {
        repository: getRepositoryFor(entity),
        route,
        url,
    };
}
