'use client';

import { admin } from '@/lib/route-register';
import trpc from '@/lib/trcp/client';
import { EntityForm, RequiredStar, extractErrors } from '@/view/form/shared';
import yoink from '@/view/form/yoink';
import { Input } from '@/view/layout';
import { useRouter } from 'next/navigation';
import { type FormEvent } from 'react';
import toast from 'react-hot-toast';

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

    const isNew = id === 'add';

    return (
        <EntityForm onSubmit={onSubmit}>
            <input type="hidden" name="id" value={isNew ? '' : id} />

            <EntityForm.Header>
                <h2 className="font-bold text-2xl">{song?.name ?? 'Nová skladba'}</h2>
            </EntityForm.Header>

            <EntityForm.Row className="border-b">
                <div className="flex items-center gap-2 pr-4">
                    <label>
                        Název
                        <RequiredStar />
                    </label>
                    <Input placeholder="70A" name="number" required />
                    <Input placeholder="Mambomania" name="name" required />
                </div>
            </EntityForm.Row>

            <EntityForm.Row className="border-b">
                <label>Skladatel</label>
                <Input placeholder="Glenn Miller" name="composer" />
            </EntityForm.Row>

            <EntityForm.Row className="border-b">
                <label>Aranžér</label>
                <Input placeholder="James Novak" name="arranger" />
            </EntityForm.Row>

            <EntityForm.Row className="border-b">
                <label>Odkaz</label>
                <Input placeholder="https://youtu.be/-XQybKMXL-k" name="arranger" />
            </EntityForm.Row>
        </EntityForm>
    );
}
