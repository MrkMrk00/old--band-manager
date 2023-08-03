'use client';

import { type FormEvent, type MouseEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import trpc from '@/lib/trcp/client';
import Modal, { Button, Input, LoadingSpinner } from '@/view/layout';
import { FaPlus, FaTrash } from 'react-icons/fa6';
import { type FormProps, FormRow } from '@/view/entity-form/_form-utils';

export type { FormProps };

export default function InstrumentForm({ id }: FormProps) {
    const router = useRouter();

    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

    const { data: instrument, refetch, isLoading } = trpc.instruments.one.useQuery(+id);
    const { data, error, mutate, isSuccess } = trpc.instruments.upsert.useMutation();

    const deleteMut = trpc.instruments.delete.useMutation();

    function handleSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        const data: any = Object.fromEntries(new FormData(ev.currentTarget));

        if (data['id']) {
            data['id'] = +data['id'];
        } else {
            delete data['id'];
        }

        // @ts-ignore
        mutate(data);
    }

    function handleDelete(id?: number) {
        setDeleteModalIsOpen(false);

        if (id === 1 && instrument?.id) {
            deleteMut.mutate(instrument.id);
        }
    }

    function handleDeleteGrouping(ev: MouseEvent<HTMLSpanElement>) {
        ev.currentTarget.parentElement?.remove();
    }

    if (isSuccess && !instrument) {
        router.push(`/admin/instruments/${data}`);
    }

    if (isSuccess && instrument) {
        void refetch();
    }

    if (deleteMut.isSuccess) {
        router.push('/admin/instruments?refetch=1');
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
                        title="Fakt jako?"
                        isOpen={deleteModalIsOpen}
                        onClose={handleDelete}
                        buttons={[
                            { id: 0, children: 'Tak ne, no', rightSide: true },
                            { id: 1, className: 'bg-red-500', children: 'Trust me bro' },
                        ]}
                    >
                        Tímto krokem smažeš nástroj a možná ti pak někde bude chybět :(
                    </Modal>

                    <Input type="hidden" name="id" defaultValue={instrument?.id} />

                    <FormRow className="px-4 py-2 border-b border-b-gray-200 bg-slate-100 rounded-t-xl">
                        <h3 className="text-2xl font-bold">
                            {!instrument
                                ? 'Přidej nový nástroj'
                                : `${instrument.name + ' ' + (instrument.subname ?? '')}`}
                        </h3>
                    </FormRow>

                    <FormRow className="px-4 py-2 border-b border-b-gray-200">
                        <label htmlFor="InstrumentRow__name">Název</label>
                        <div className="flex flex-col w-2/3">
                            <Input
                                id="InstrumentRow__name"
                                type="text"
                                name="name"
                                defaultValue={instrument?.name}
                                placeholder="Pozoun"
                            />
                        </div>
                    </FormRow>

                    <FormRow className="px-4 py-2 border-b border-b-gray-200">
                        <label htmlFor="InstrumentRow__subname">Druhý název</label>
                        <div className="flex flex-col w-2/3">
                            <Input
                                id="InstrumentRow__subname"
                                type="text"
                                name="subname"
                                defaultValue={instrument?.subname}
                                placeholder="4"
                            />
                        </div>
                    </FormRow>

                    <FormRow className="px-4 py-2 border-b border-b-gray-200">
                        <label htmlFor="InstrumentRow__subname">Adresa ikony</label>
                        <div className="flex flex-col w-2/3">
                            <Input
                                id="InstrumentRow__icon"
                                type="url"
                                name="icon"
                                defaultValue={instrument?.icon}
                                placeholder="https://instrument-icons.com/trombone.png"
                            />
                        </div>
                    </FormRow>

                    <FormRow className="px-4 py-2 border-b border-b-gray-200">
                        <label>Sekce</label>
                        <div className="flex flex-row justify-between w-2/3 items-center">
                            <div className="px-2 py-4">
                                {instrument?.groupings.map(g => (
                                    <div
                                        title={g.name}
                                        className="flex flex-row gap-2 justify-between rounded-3xl bg-yellow-300 border border-yellow-300 pl-3"
                                        key={g.id}
                                    >
                                        <input type="hidden" name="groupings[]" value={g.id} />
                                        <span className="pl-2">{g.name.at(0)}</span>
                                        <small
                                            onClick={handleDeleteGrouping}
                                            className="flex flex-col justify-center text-transparent hover:text-red-500 px-1 cursor-pointer"
                                        >
                                            X
                                        </small>
                                    </div>
                                ))}
                            </div>
                            <span className="text-gray-500 hover:brightness-95 bg-white p-2 rounded-xl cursor-pointer">
                                <FaPlus size="1.3em" />
                            </span>
                        </div>
                    </FormRow>

                    <FormRow className="px-4 py-4 justify-between">
                        <Button type="submit" className="bg-green-300">
                            Uložit
                        </Button>
                        <span>
                            {error?.data?.code} {error?.message}
                        </span>
                        {instrument?.id && (
                            <Button
                                type="button"
                                onClick={() => setDeleteModalIsOpen(true)}
                                className="bg-red-500 inline-flex items-center"
                            >
                                <FaTrash size="1em" />
                                &emsp;Smazat
                            </Button>
                        )}
                    </FormRow>
                </form>
            )}
        </>
    );
}