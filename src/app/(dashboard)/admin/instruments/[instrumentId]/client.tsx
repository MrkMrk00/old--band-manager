'use client';

import Modal, { Button, Input } from '@/view/layout';
import { twMerge } from 'tailwind-merge';
import type { FormEvent, ReactNode, AllHTMLAttributes } from 'react';
import trpc from '@/lib/trcp/client';
import { FaTrash } from 'react-icons/fa6';
import { useState } from 'react';
import { redirect } from 'next/navigation';

type FormRowProps = {
    children?: ReactNode;
} & AllHTMLAttributes<HTMLDivElement>;

function FormRow({ children, className, ...rest }: FormRowProps) {
    return (
        <div
            {...rest}
            className={twMerge(
                'flex flex-row w-full justify-between items-center gap-3',
                className,
            )}
        >
            {children}
        </div>
    );
}

export default function InstrumentForm({ instrumentId }: { instrumentId: `${number}` | 'add' }) {
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

    const { data: instrument, refetch } = trpc.instruments.one.useQuery(+instrumentId);
    const { data, error, mutate, isSuccess } = trpc.instruments.upsert.useMutation();

    const deleteMut = trpc.instruments.delete.useMutation();

    function handleSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        const data = Object.fromEntries(new FormData(ev.currentTarget));

        // @ts-ignore
        mutate(data);
    }

    function handleDelete(id?: number) {
        setDeleteModalIsOpen(false);

        if (id === 1 && instrument?.id) {
            deleteMut.mutate(instrument.id);
        }
    }

    if (isSuccess && !instrument) {
        redirect(`/admin/instruments/${data}`);
    }

    if (isSuccess && instrument) {
        void refetch();
    }

    if (deleteMut.isSuccess) {
        // force reload data
        location.replace('/admin/instruments');
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-full rounded-xl border shadow">
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

            <FormRow className="px-4 py-2 border-b border-b-gray-200 bg-slate-100">
                <h3 className="text-2xl font-bold">
                    {!instrument ? 'Přidej nový nástroj' : `${instrument.name}`}
                </h3>
            </FormRow>

            <FormRow className="px-4 py-2 border-b border-b-gray-200">
                <label htmlFor="InstrumentRow__name">Název</label>
                <div className="flex flex-col w-2/3 pt-[1.2em]">
                    <Input
                        id="InstrumentRow__name"
                        type="text"
                        name="name"
                        defaultValue={instrument?.name}
                        placeholder="Pozoun"
                    />
                    <small className="h-[1.2em] inline-flex flex-row justify-end text-red-500"></small>
                </div>
            </FormRow>

            <FormRow className="px-4 py-2 border-b border-b-gray-200">
                <label htmlFor="InstrumentRow__subname">Druhý název</label>
                <div className="flex flex-col w-2/3 pt-[1.2em]">
                    <Input
                        id="InstrumentRow__subname"
                        type="text"
                        name="subname"
                        defaultValue={instrument?.subname}
                        placeholder="4"
                    />
                    <small className="h-[1.2em] inline-flex flex-row justify-end text-red-500"></small>
                </div>
            </FormRow>

            <FormRow className="px-4 py-2 border-b border-b-gray-200">
                <label htmlFor="InstrumentRow__subname">Adresa ikony</label>
                <div className="flex flex-col w-2/3 pt-[1.2em]">
                    <Input
                        id="InstrumentRow__icon"
                        type="url"
                        name="icon"
                        defaultValue={instrument?.icon}
                        placeholder="https://instrument-icons.com/trombone.png"
                    />
                    <small className="h-[1.2em] inline-flex flex-row justify-end text-red-500"></small>
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
    );
}
