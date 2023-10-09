'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa6';
import { admin } from '@/lib/route-register';
import trpc from '@/lib/trcp/client';
import EntityFormSaveButton from '@/view/admin/components/EntityFormSaveButton';
import { useConfirmModal } from '@/view/form/modals';
import { type FormProps, FormRow, extractErrors } from '@/view/form/shared';
import yoink from '@/view/form/yoink';
import { Button, Input, LoadingSpinner } from '@/view/layout';
import { ConfirmModal } from '@/view/layout-stateful';

function useInstrumentGrouping(id: `${number}` | 'add') {
    const { one, upsert, delete: remove } = trpc.instruments.groupings;
    const utils = trpc.useContext();
    const invalidate = () => utils.instruments.groupings.fetchAll.invalidate();
    const router = useRouter();

    const fetchQuery = id === 'add' ? null : one.useQuery(+id);
    const upsertMut = upsert.useMutation({
        onSuccess: id => {
            invalidate();

            if (!fetchQuery) {
                router.push(admin().show('instrument_groupings', id).build());
            }
        },
    });
    const deleteMut = remove.useMutation({
        onSuccess: () => {
            invalidate();
            router.push(admin().list('instrument_groupings').build());
        },
    });

    for (const error of extractErrors(true, fetchQuery, upsertMut, deleteMut)) {
        toast.error(error);
    }

    return {
        remove: () => fetchQuery?.data && deleteMut.mutate(fetchQuery.data.id),
        onSubmit: (ev: FormEvent<HTMLFormElement>) => {
            ev.preventDefault();

            const data = yoink(ev.currentTarget);
            console.log(data);

            upsertMut.mutate(data as unknown as Parameters<typeof upsertMut.mutate>[0]);
        },
        grouping: fetchQuery?.data,
        isLoading: fetchQuery?.isLoading,
        isSaving: upsertMut.isLoading,
    };
}

export default function GroupingForm({ id }: FormProps) {
    const { isLoading, grouping, isSaving, onSubmit, remove } = useInstrumentGrouping(id);
    const { props: confirmModalProps, open: openConfirmModal } = useConfirmModal({
        innerText: 'Tímto krokem smažeš celou sekci a možná ti pak někde bude chybět :(',
        onConfirm: remove,
    });

    return (
        <>
            {isLoading && id !== 'add' && (
                <div className="w-full h-[250px] inline-flex justify-center items-center">
                    <LoadingSpinner size="3em" color="black" />
                </div>
            )}

            {(!isLoading || id === 'add') && (
                <form onSubmit={onSubmit} className="flex flex-col w-full rounded-xl border shadow">
                    <ConfirmModal {...confirmModalProps} />

                    <input
                        type="hidden"
                        name="id"
                        value={grouping?.id}
                        data-y-type="int"
                        data-y-optional
                    />

                    <FormRow className="px-4 py-2 bg-slate-100 rounded-t-xl border-b">
                        <h3 className="font-bold text-2xl">
                            {!grouping
                                ? 'Přidej novou nástrojovou sekci'
                                : `Sekce ${grouping.name}`}
                        </h3>
                    </FormRow>

                    <FormRow className="px-4 pt-4 border-b">
                        <label className="pb-2" htmlFor="GroupingForm__name">
                            Název
                        </label>
                        <div className="flex flex-col w-100">
                            <Input
                                id="GroupingForm__name"
                                name="name"
                                defaultValue={grouping?.name}
                                placeholder="Žestě"
                            />
                        </div>
                    </FormRow>

                    <FormRow className="p-4 justify-between">
                        <EntityFormSaveButton isSaving={isSaving} />

                        {grouping && (
                            <Button
                                className="bg-red-500 inline-flex items-center"
                                type="button"
                                onClick={openConfirmModal}
                            >
                                <FaTrash />
                                &emsp;Smazat
                            </Button>
                        )}
                    </FormRow>
                </form>
            )}
        </>
    );
}
