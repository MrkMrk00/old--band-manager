'use client';

import { admin } from '@/lib/route-register';
import trpc from '@/lib/trcp/client';
import { InstrumentGrouping } from '@/model/instrument_groupings';
import EntityFormSaveButton from '@/view/admin/components/EntityFormSaveButton';
import {
    InstrumentGroupingPicker,
    useGroupingPicker,
} from '@/view/admin/components/InstrumentGroupingPicker';
import { useConfirmModal } from '@/view/form/modals';
import { type FormProps, FormRow, extractErrors } from '@/view/form/shared';
import yoink from '@/view/form/yoink';
import { Button, Input, LoadingSpinner } from '@/view/layout';
import { ConfirmModal } from '@/view/layout-stateful';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaX } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

function useInstrument(id: `${number}` | 'add') {
    const router = useRouter();
    const utils = trpc.useContext();
    const fetchQuery = id === 'add' ? null : trpc.instruments.one.useQuery(+id);

    const upsertMut = trpc.instruments.upsert.useMutation({
        onSuccess: id => {
            utils.instruments.fetchAll.invalidate();
            const redirect = admin().show('instruments', id).build();

            if (!fetchQuery) {
                router.push(redirect);
            }
        },
    });

    const deleteMut = trpc.instruments.delete.useMutation({
        onSuccess: () => {
            utils.instruments.fetchAll.invalidate();
            const redirect = admin().list('instruments').build();

            router.push(redirect);
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

type GroupingProps = {
    id: number;

    backgroundColor: `#${string}`;
    text: string;
    className?: string;
    remove: (id: number) => void;
};

function Grouping({ id, text, backgroundColor, className, remove }: GroupingProps) {
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
                    onClick={() => remove(id)}
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
    const { instrument, isLoading, remove, onSubmit, isSaving } = useInstrument(id);

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

    function addGrouping(newGrouping: InstrumentGrouping) {
        console.log(newGrouping.id, groupings);
        if (!groupings.some(g => g.id === newGrouping.id)) {
            setGroupings([...groupings, newGrouping]);
        }
    }

    const { open: openPicker, props: pickerProps } = useGroupingPicker(addGrouping);

    return (
        <>
            {isLoading && id !== 'add' && (
                <div className="w-full h-[250px] inline-flex justify-center items-center">
                    <LoadingSpinner size="3em" color="black" />
                </div>
            )}

            {(!isLoading || id === 'add') && (
                <form onSubmit={onSubmit} className="flex flex-col w-full rounded-xl border shadow">
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
                                defaultValue={instrument?.subname ?? undefined}
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
                                defaultValue={instrument?.icon ?? undefined}
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
                                            remove={id =>
                                                setGroupings(groupings.filter(g => g.id !== id))
                                            }
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
                        <EntityFormSaveButton isSaving={isSaving} />

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
