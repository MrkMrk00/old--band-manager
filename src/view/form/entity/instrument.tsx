'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import trpc from '@/lib/trcp/client';
import { Button, Input, LoadingSpinner } from '@/view/layout';
import { Modal } from '@/view/layout-stateful';
import { FaPlus, FaTrash, FaX } from 'react-icons/fa6';
import { type FormProps, FormRow } from '@/view/form/components';
import yoink from '@/view/form/yoink';

export type { FormProps };

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

export default function InstrumentForm({ id }: FormProps) {
    const router = useRouter();

    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

    const { data: instrument, refetch, isLoading } = trpc.instruments.one.useQuery(+id);
    const { data, error, mutate, isSuccess } = trpc.instruments.upsert.useMutation();

    const deleteMut = trpc.instruments.delete.useMutation();

    function handleSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();

        // @ts-ignore
        mutate(yoink(ev.currentTarget));
    }

    function handleDelete(id?: number) {
        setDeleteModalIsOpen(false);

        if (id === 1 && instrument?.id) {
            deleteMut.mutate(instrument.id);
        }
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

                    <Input
                        type="hidden"
                        name="id"
                        defaultValue={instrument?.id}
                        data-y-type="int"
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
                            <span className="text-gray-500 hover:brightness-95 bg-white p-2 rounded-xl cursor-pointer">
                                <FaPlus size="1.3em" />
                            </span>
                        </div>
                    </FormRow>

                    <FormRow className="px-4 py-4 justify-between">
                        <Button type="submit" className="bg-green-300">
                            Uložit
                        </Button>
                        <small className="text-red-500 whitespace-normal max-w-[400px] overflow-clip">
                            {error?.data?.code} {error?.message}
                        </small>
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
