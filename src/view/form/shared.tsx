import { TRPCClientErrorLike } from '@trpc/client';
import { useRouter } from 'next/navigation';
import { AllHTMLAttributes, FormHTMLAttributes, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';

export type FormRowProps = {
    children?: ReactNode;
} & AllHTMLAttributes<HTMLDivElement>;

export function FormRow({ children, className, ...rest }: FormRowProps) {
    return (
        <div
            {...rest}
            className={twMerge(
                'flex flex-row w-full justify-between items-center gap-3 py-4',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function RequiredStar() {
    return (
        <span title="povinnné" className="text-red-500 text-sm align-text-top">
            *
        </span>
    );
}

export type FormProps = {
    id: `${number}` | 'add';
};

export function useFormSubmit({
    wasRemoved,
    wasUpserted,
    errors,
    refetch,
    newId,
}: {
    wasRemoved: boolean;
    wasUpserted: boolean;
    errors: string[];
    refetch: () => unknown;
    newId: number | undefined;
}) {
    const router = useRouter();
    if (wasUpserted) {
        if (refetch) {
            void refetch();
        } else {
            router.push(`/admin/instruments/${newId}`);
        }
    }

    if (wasRemoved) {
        router.push('/admin/instruments');
    }

    if (errors) {
        for (const error of errors) {
            toast.error(error);
        }
    }
}

type Optional<T> = T | null | undefined;

type Removable = { remove: () => void } | { reset: () => void };

type QueryOrMutation = Optional<
    {
        error: Optional<TRPCClientErrorLike<any>>;
    } & Removable
>;

export function extractErrors(resetAfter: boolean, ...queriesOrMutations: QueryOrMutation[]) {
    const allErrors = [];
    for (const queryOrMut of queriesOrMutations) {
        if (queryOrMut?.error) {
            allErrors.push(queryOrMut.error.message);

            if (!resetAfter) {
                continue;
            }

            if ('remove' in queryOrMut) {
                queryOrMut.remove();
            } else {
                queryOrMut.reset();
            }
        }
    }

    return allErrors;
}

export function EntityForm({ children, className, ...props }: FormHTMLAttributes<HTMLFormElement>) {
    return (
        <form
            {...props}
            className={twMerge(
                className,
                'rounded-2xl border shadow-md overflow-hidden w-full max-w-2xl',
            )}
        >
            {children}
        </form>
    );
}

EntityForm.Row = function ({ className, ...props }: FormRowProps) {
    return <FormRow className={twMerge('px-4 py-2', className)} {...props} />;
};

EntityForm.Header = function ({ className, ...props }: FormRowProps) {
    return (
        <FormRow
            className={twMerge(
                'px-4 py-2 border-b border-b-gray-200 bg-slate-100 font-bold text-2xl',
                className,
            )}
            {...props}
        />
    );
};
