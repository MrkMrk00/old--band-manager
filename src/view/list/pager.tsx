'use client';

import { isMobile } from '@/view/client.helpers';
import type { AllHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { FaLeftLong, FaRightLong } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

export type PagerProps = OmitKeys<AllHTMLAttributes<HTMLDivElement>, 'children'> & {
    maxPage: number;
    curPage: number;
    onPageChange: (page: number) => void;
    btnClassName?: string;
};

function PagerButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { disabled?: boolean }) {
    const { className, children, disabled, ...restProps } = props;

    return (
        <button
            {...restProps}
            className={twMerge(
                'w-full h-full px-4 py-2 border inline-flex justify-center items-center transition-all',
                className,
                disabled ? 'pointer-events-none' : 'hover:brightness-90',
            )}
        >
            {children}
        </button>
    );
}

export default function Pager(props: PagerProps) {
    const { maxPage, curPage, className, onPageChange, btnClassName, ...divProps } = props;

    return (
        <div
            {...divProps}
            className={twMerge(
                'flex flex-row rounded-xl items-center bg-white',
                isMobile() ? 'w-full justify-center' : '',
                className,
            )}
        >
            <PagerButton
                disabled={curPage === 1}
                className="rounded-l-xl bg-inherit"
                onClick={() => {
                    if (curPage <= 1) {
                        return;
                    }
                    onPageChange(curPage - 1);
                }}
            >
                {curPage > 1 ? <FaLeftLong /> : <span className="w-[1em] h-[1em]"></span>}
            </PagerButton>
            <div className="px-4 py-2 h-full w-full text-center border-y bg-inherit whitespace-nowrap">
                <span className="font-bold">{curPage} </span>
                <small>z {maxPage}</small>
            </div>
            <PagerButton
                className="rounded-r-xl bg-inherit"
                disabled={curPage === maxPage}
                onClick={() => {
                    if (curPage >= maxPage) {
                        return;
                    }
                    onPageChange(curPage + 1);
                }}
            >
                {curPage < maxPage ? <FaRightLong /> : <span className="w-[1em] h-[1em]"></span>}
            </PagerButton>
        </div>
    );
}
