'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import trpc from '@/lib/trcp/client';
import { Button, Input, LoadingSpinner } from '@/view/layout';
import { ConfirmModal } from '@/view/layout-stateful';
import { FaPlus, FaTrash, FaX } from 'react-icons/fa6';
import { type FormProps, FormRow } from '@/view/form/shared-components';
import yoink from '@/view/form/yoink';
import { useConfirmModal } from '@/view/form/modals';
import toast from 'react-hot-toast';
import InstrumentGroupingPicker from '@/view/form/components/InstrumentGroupingPicker';

type GroupingProps = {
    id: number;

    backgroundColor: `#${string}`;
    text: string;
};

function Grouping({ id, text, backgroundColor }: GroupingProps) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div className="flex flex-col gap-2" ref={ref}>
            <div
                className="inline-flex justify-center items-center rounded-3xl h-[2.3em] w-[2.3em] text-center shadow"
                style={{ backgroundColor }}
                key={id}
            >
                <input type="hidden" name="groupings[]" value={id} data-y-array data-y-type="int" />
                {text.at(0)}
                <span
                    onClick={() => void ref.current?.remove()}
                    title="Odebrat"
                    className="absolute flex justify-center items-center text-transparent hover:text-white hover:bg-red-500 rounded-3xl h-[2.3em] w-[2.3em] text-center cursor-pointer transition-all shadow"
                >
                    <FaX size="1em" />
                </span>
            </div>
            <small className="inline-flex justify-center items-center">{text}</small>
        </div>
    );
}

function useInstrument(id: `${number}` | 'add') {
    const fetchQuery = id === 'add' ? null : trpc.instruments.one.useQuery(+id);
    const upsertMut = trpc.instruments.upsert.useMutation();
    const deleteMut = trpc.instruments.delete.useMutation();

    const errors = [];
    if (fetchQuery?.error) {
        errors.push(fetchQuery.error);
    }

    if (upsertMut.error) {
        errors.push(upsertMut.error);
    }

    if (deleteMut.error) {
        errors.push(deleteMut.error);
    }

    return {
        remove: deleteMut.mutate,
        wasRemoved: deleteMut.isSuccess,

        instrument: fetchQuery?.data,
        isLoading: fetchQuery?.isLoading,
        fetchError: fetchQuery?.error,
        refetch: fetchQuery?.refetch,

        upsert: upsertMut.mutate,
        wasUpserted: upsertMut.isSuccess,
        newId: upsertMut.data,

        errors,
    };
}

export default function InstrumentForm({ id }: FormProps) {
    const router = useRouter();
    const {
        newId,
        wasUpserted,
        instrument,
        refetch,
        isLoading,
        upsert,
        remove,
        wasRemoved,
        errors,
    } = useInstrument(id);

    const [pickGroupings, setPickGroupings] = useState(false);

    const { props: deleteModalProps, open: confirmDelete } = useConfirmModal({
        innerText: 'Opravdu chceš tento nástroj smazat? Možná ti pak bude někde chybět.',
        onConfirm: () => {
            if (instrument?.id) {
                remove(instrument.id);
            }
        },
    });

    function handleSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();

        upsert(yoink(ev.currentTarget) as Parameters<typeof upsert>[0]);
    }

    if (wasUpserted) {
        if (instrument && refetch) {
            void refetch();
        } else {
            router.push(`/admin/instruments/${newId}`);
        }
    }

    if (wasRemoved) {
        router.push('/admin/instruments');
    }

    if (errors) {
        for (const { message } of errors) {
            toast.error(message);
        }
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
                    <ConfirmModal {...deleteModalProps} />

                    <Input
                        type="hidden"
                        name="id"
                        defaultValue={instrument?.id}
                        data-y-type="int"
                        data-y-optional
                    />

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
                                {instrument?.groupings.map(function ({ id, name }) {
                                    return (
                                        <Grouping
                                            key={id}
                                            id={id}
                                            backgroundColor={'#ABCD00'}
                                            text={name}
                                        />
                                    );
                                })}
                            </div>
                            <Button
                                type="button"
                                onClick={() => setPickGroupings(prev => !prev)}
                                className="text-gray-500 px-2 bg-white cursor-pointer shadow-none"
                            >
                                <FaPlus size="1.3em" />
                            </Button>
                            <InstrumentGroupingPicker
                                isOpen={pickGroupings}
                                onClose={() => setPickGroupings(false)}
                                onAdd={() => {}}
                            />
                        </div>
                    </FormRow>

                    <FormRow className="px-4 py-4 justify-between">
                        <Button type="submit" className="bg-green-300">
                            Uložit
                        </Button>
                        {instrument?.id && (
                            <Button
                                type="button"
                                onClick={confirmDelete}
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
