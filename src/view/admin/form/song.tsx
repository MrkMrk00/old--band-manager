'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { admin } from '@/lib/route-register';
import trpc from '@/lib/trcp/client';
import { extractErrors } from '@/view/form/shared';
import yoink from '@/view/form/yoink';

function useSong(id: `${number}` | 'add') {
    const router = useRouter();
    const utils = trpc.useContext();
    const fetchQuery = id === 'add' ? null : trpc.songs.one.useQuery(+id);

    const upsertMut = trpc.songs.upsert.useMutation({
        onSuccess: id => {
            utils.instruments.fetchAll.invalidate();

            if (!fetchQuery) {
                router.push(admin().show('songs', id).build());
            }
        },
    });

    const deleteMut = trpc.songs.remove.useMutation({
        onSuccess: () => {
            utils.instruments.fetchAll.invalidate();
            router.push(admin().list('songs').build());
        },
    });

    function formOnSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        const form = ev.currentTarget;
        const upsert = upsertMut.mutate;

        // @ts-ignore
        upsert(yoink(form));
    }

    for (const error of extractErrors(true, fetchQuery, upsertMut, deleteMut)) {
        toast.error(error);
    }

    function triggerDelete() {
        const instrument = fetchQuery?.data;

        if (instrument) {
            deleteMut.mutate(instrument.id);
        }
    }

    return {
        remove: triggerDelete,
        song: fetchQuery?.data,
        isLoading: fetchQuery?.isLoading,
        onSubmit: formOnSubmit,
        isSaving: upsertMut.isLoading,
    };
}
export default function SongForm({ id }: { id: `${number}` | 'add' }) {
    const { song, isSaving, onSubmit, isLoading, remove } = useSong(id);

    return (
        <div>
            <h1>{song?.name ?? 'Tvoje mama'}</h1>
            <form className="">
                <input />
            </form>
        </div>
    );
}
