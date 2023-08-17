import trpc from '@/lib/trcp/client';
import { type ReactNode, useMemo, useState } from 'react';
import { InstrumentGrouping } from '@/model/instrument_groupings';
import { FaAt, FaFacebook } from 'react-icons/fa6';
import type { TRPCClientErrorLike } from '@trpc/client';
import type { ObjectType } from '@/view/list/types';

export type HookReturn = {
    page: number;
    setPage: (a: number) => void;

    maxPage: number;

    refetch: () => void;
    remove: () => void;
    error: TRPCClientErrorLike<any> | null;
    isLoading: boolean;

    objects: ObjectType[];
};

function usePager() {
    const [page, setPage] = useState(1);

    return {
        page,
        setPage,
    };
}

function renderGroupings(groupings: InstrumentGrouping[]): ReactNode {
    return (
        <div className="flex flex-row">
            {groupings.map(g => (
                <small
                    className="rounded-2xl h-[1em] bg-yellow-300 p-2 inline-flex justify-center items-center"
                    key={g.id}
                >
                    {g.name.at(0)}
                </small>
            ))}
        </div>
    );
}

export function useInstrumentsList(perPage: number = 20): HookReturn {
    const { page, setPage } = usePager();
    const { data, refetch, remove, error, isLoading } = trpc.instruments.fetchAll.useQuery({
        page,
        perPage,
    });

    const { data: allGroupings } = trpc.instruments.groupings.fetchAll.useQuery({
        perPage: Number.MAX_SAFE_INTEGER,
    });

    const objects = useMemo(() => {
        if (!data || data.payload.length === 0) {
            return [];
        }

        const objects = new Array(data.payload.length);
        let at = 0;
        for (let obj of data.payload) {
            const { id, name, subname, created_at, groupings } = obj;
            const includeGroupings = allGroupings?.payload.filter(({ id }) =>
                groupings.includes(id),
            );

            objects[at] = {
                id,
                name: `${name}${subname ? ' ' + subname : ''}`,
                created_at: new Date(created_at).toLocaleString('cs'),
                icon: ':)',
                groupings: includeGroupings ? renderGroupings(includeGroupings) : '',
            };

            at++;
        }

        return objects;
    }, [data, allGroupings]);

    return {
        page,
        setPage,
        maxPage: data?.maxPage ?? 0,
        refetch,
        remove,
        error,
        objects,
        isLoading,
    } satisfies HookReturn;
}

export function useInstrumentGroupingsList(perPage: number = 20): HookReturn {
    const { page, setPage } = usePager();
    const { data, isLoading, error, refetch, remove } =
        trpc.instruments.groupings.fetchAll.useQuery({
            page,
            perPage,
        });

    const groupings = useMemo(() => {
        if (!data) {
            return [];
        }

        const mapped = new Array(data.payload.length);
        let at = 0;
        for (const { id, name, created_at, admin_name } of data.payload) {
            mapped[at] = {
                id,
                name,
                created_at: new Date(created_at).toLocaleString('cs'),
                admin_name: !admin_name ? '' : admin_name.split(' ')[0],
            };

            at++;
        }

        return mapped;
    }, [data]);

    return {
        page,
        setPage,
        error,
        refetch,
        remove,
        isLoading,
        objects: groupings,
        maxPage: data?.maxPage ?? 0,
    } satisfies HookReturn;
}

export function useUsersList(perPage: number = 20): HookReturn {
    const { page, setPage } = usePager();
    const { data, error, refetch, isLoading, remove } = trpc.users.fetchAll.useQuery({ page });

    const objects = useMemo(() => {
        if (!data?.payload.length) {
            return [];
        }

        const objs = new Array(data.payload.length);
        let at = 0;
        for (const { id, display_name, created_at, fb_id, email, roles } of data.payload) {
            objs[at] = {
                id,
                display_name,
                login: (
                    <div className="inline-flex flex-row justify-center items-center gap-2">
                        {fb_id && (
                            <FaFacebook title="Facebook" className="text-blue-600" size="1.5em" />
                        )}
                        {email && <FaAt title="E-mail" size="1.5em" />}
                    </div>
                ),
                created_at: new Date(created_at).toLocaleDateString('cs'),
                roles: roles.join(', '),
            };
        }

        return objs;
    }, [data]);

    return {
        page,
        setPage,
        objects,
        refetch,
        remove,
        isLoading,
        error,
        maxPage: data?.maxPage ?? 0,
    } satisfies HookReturn;
}
