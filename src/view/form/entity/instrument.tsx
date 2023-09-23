'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaX } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import { admin } from '@/lib/route-register';
import trpc from '@/lib/trcp/client';
import {
    InstrumentGroupingPicker,
    useGroupingPicker,
} from '@/view/form/components/InstrumentGroupingPicker';
import { useConfirmModal } from '@/view/form/modals';
import { type FormProps, FormRow, extractErrors } from '@/view/form/shared';
import yoink from '@/view/form/yoink';
import { Button, Input, LoadingSpinner } from '@/view/layout';
import { ConfirmModal } from '@/view/layout-stateful';
import { InstrumentGrouping } from '@/model/instrument_groupings';

type GroupingProps = {
    id: number;

    backgroundColor: `#${string}`;
    text: string;
    className?: string;
};

function useInstrument(id: `${number}` | 'add') {
    const router = useRouter();
    const fetchQuery = id === 'add' ? null : trpc.instruments.one.useQuery(+id);
    const upsertMut = trpc.instruments.upsert.useMutation();
    const deleteMut = trpc.instruments.delete.useMutation();

    function registerForm(form: HTMLFormElement | null) {
        if (!form) {
            return;
        }

        const upsert = upsertMut.mutate;

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();

            upsert(yoink(this) as Parameters<typeof upsert>[0]);
        });
    }

    for (const error of extractErrors(true, fetchQuery, upsertMut, deleteMut)) {
        toast.error(error);
    }

    // was removed successfully
    if (deleteMut.isSuccess) {
        router.push(admin().list('instruments').addSearchParam('refetch', '1').build());
    }

    // was inserted
    if (upsertMut.isSuccess && !fetchQuery) {
        const newId = upsertMut.data;
        router.push(admin().show('instruments', newId).addSearchParam('refetch', '1').build());
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
        formRef: registerForm,
    };
}

function Grouping({ id, text, backgroundColor, className }: GroupingProps) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div className={twMerge('flex flex-col gap-2 items-center', className)} ref={ref}>
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
    const { instrument, isLoading, remove, formRef } = useInstrument(id);

    const [groupings, setGroupings] = useState<InstrumentGrouping[]>([]);
    useEffect(() => {
        if (instrument) {
            setGroupings(instrument.groupings);
        }
    }, [instrument]);

    const { props: deleteModalProps, open: confirmDelete } = useConfirmModal({
        innerText: 'Opravdu chceš tento nástroj smazat? Možná ti pak bude někde chybět.',
        onConfirm: remove,
    });

    const { open: openPicker, props: pickerProps } = useGroupingPicker(newGrouping =>
        setGroupings([...groupings, newGrouping]),
    );

    return (
        <>
            {isLoading && id !== 'add' && (
                <div className="w-full h-[250px] inline-flex justify-center items-center">
                    <LoadingSpinner size="3em" color="black" />
                </div>
            )}

            {(!isLoading || id === 'add') && (
                <form ref={formRef} className="flex flex-col w-full rounded-xl border shadow">
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
                                data-y-optional
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
                                data-y-optional
                            />
                        </div>
                    </FormRow>

                    <FormRow className="px-4 py-2 border-b border-b-gray-200">
                        <label>Sekce</label>
                        <div className="flex flex-row justify-evenly w-2/3 items-center">
                            <div className="px-2 py-4 flex flex-row gap-2 flex-wrap w-[90%]">
                                {groupings.map(function ({ id, name, custom_data }) {
                                    return (
                                        <Grouping
                                            className="w-1/6"
                                            key={id}
                                            id={id}
                                            backgroundColor={
                                                custom_data && 'color' in custom_data
                                                    ? (custom_data.color as `#${string}`)
                                                    : '#FFFFFF'
                                            }
                                            text={name}
                                        />
                                    );
                                })}
                            </div>
                            <Button
                                type="button"
                                onClick={openPicker}
                                className="text-gray-500 px-2 bg-white cursor-pointer shadow-none"
                            >
                                <FaPlus size="1.3em" />
                            </Button>
                            <InstrumentGroupingPicker {...pickerProps} />
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
