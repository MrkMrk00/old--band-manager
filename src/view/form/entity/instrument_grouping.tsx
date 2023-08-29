'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import trpc from '@/lib/trcp/client';
import { Button, Input, LoadingSpinner } from '@/view/layout';
import { Modal } from '@/view/layout-stateful';
import { FaTrash } from 'react-icons/fa6';
import { type FormProps, FormRow } from '@/view/form/components';

export type { FormProps };

export default function GroupingForm({ id }: FormProps) {
    const router = useRouter();
    const [modalIsOpen, setModalOpen] = useState(false);

    const { data, isLoading, refetch } = trpc.instruments.groupings.one.useQuery(+id);
    const upsertMut = trpc.instruments.groupings.upsert.useMutation();
    const deleteMut = trpc.instruments.groupings.delete.useMutation();

    function handleSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        const formData: any = Object.fromEntries(new FormData(ev.currentTarget));

        if (formData['id']) {
            formData['id'] = +formData['id'];
        } else {
            delete formData['id'];
        }

        // @ts-ignore
        upsertMut.mutate(formData);
    }

    if (upsertMut.isSuccess && typeof upsertMut.data === 'number') {
        router.push(`/admin/instruments/${upsertMut.data}?t=groupings`); // Ende Schluss
    }

    if (upsertMut.isSuccess && data) {
        void refetch();
    }

    if (deleteMut.isSuccess) {
        router.push('/admin/instruments?t=groupings&refetch=1');
    }

    function handleDelete(num?: number) {
        if (!data) {
            throw new Error('Data by tu měly bejt');
        }

        if (num === 1) {
            deleteMut.mutate(data.id);
        }

        setModalOpen(false);
    }

    return (
        <>
            {isLoading && id !== 'add' && (
                <div className="w-full h-[250px] inline-flex justify-center items-center">
                    <LoadingSpinner size="3em" color="black" />
                </div>
            )}

            {(!isLoading || id === 'add') && (
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-full rounded-xl border shadow"
                >
                    <Modal
                        title="Ještě si to rozmysli"
                        isOpen={modalIsOpen}
                        onClose={handleDelete}
                        buttons={[
                            { id: 0, children: 'Tak ne, no', rightSide: true },
                            { id: 1, className: 'bg-red-500', children: 'Trust me bro' },
                        ]}
                    >
                        Tímto krokem smažeš celou sekci a možná ti pak někde bude chybět :(
                    </Modal>

                    <input type="hidden" name="id" value={data?.id} />

                    <FormRow className="px-4 py-2 bg-slate-100 rounded-t-xl border-b">
                        <h3 className="font-bold text-2xl">
                            {!data ? 'Přidej novou nástrojovou sekci' : `Sekce ${data.name}`}
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
                                defaultValue={data?.name}
                                placeholder="Žestě"
                            />
                            <small className="h-[1.2em] text-red-500">
                                {upsertMut.error?.message}
                            </small>
                        </div>
                    </FormRow>

                    <FormRow className="p-4 justify-between">
                        <Button className="bg-green-300" type="submit">
                            Uložit
                        </Button>

                        {data && (
                            <Button
                                className="bg-red-500 inline-flex items-center"
                                type="button"
                                onClick={() => setModalOpen(true)}
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
