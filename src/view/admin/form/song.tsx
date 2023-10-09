import { useRouter } from 'next/navigation';
import { type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { admin } from '@/lib/route-register';
import trpc from '@/lib/trcp/client';
import { extractErrors } from '@/view/form/shared';
import yoink from '@/view/form/yoink';

function useInstrument(id: `${number}` | 'add') {
    const router = useRouter();
    const utils = trpc.useContext();
    const fetchQuery = id === 'add' ? null : trpc.songs.one.useQuery(+id);

    const upsertMut = trpc.instruments.upsert.useMutation({
        onSuccess: id => {
            utils.instruments.fetchAll.invalidate();

            if (!fetchQuery) {
                router.push(admin().show('instruments', id).build());
            }
        },
    });

    const deleteMut = trpc.instruments.delete.useMutation({
        onSuccess: () => {
            utils.instruments.fetchAll.invalidate();
            router.push(admin().list('instruments').build());
        },
    });

    function formOnSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        const form = ev.currentTarget;
        const upsert = upsertMut.mutate;

        upsert(yoink(form) as Parameters<typeof upsert>[0]);
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
        instrument: fetchQuery?.data,
        isLoading: fetchQuery?.isLoading,
        onSubmit: formOnSubmit,
        isSaving: upsertMut.isLoading,
    };
}
export default function SongForm() {}
