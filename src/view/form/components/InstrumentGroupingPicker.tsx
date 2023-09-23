import { useState } from 'react';
import trpc from '@/lib/trcp/client';
import { Button } from '@/view/layout';
import { Modal } from '@/view/layout-stateful';
import { InstrumentGrouping } from '@/model/instrument_groupings';

export type PickerProps = {
    isOpen: boolean;
    onClose: () => unknown;
    onAdd: (grouping: InstrumentGrouping) => unknown;
};

export function useGroupingPicker(onAdd: PickerProps['onAdd']): {
    props: PickerProps;
    open: () => void;
    close: () => void;
} {
    const [isOpen, setOpened] = useState(false);

    const close = () => setOpened(false);
    const open = () => setOpened(true);

    return {
        open,
        close,
        props: { onAdd, isOpen, onClose: close },
    };
}

export function InstrumentGroupingPicker({ isOpen, onClose, onAdd }: PickerProps) {
    if (!isOpen) {
        return <></>;
    }

    const { data } = trpc.instruments.groupings.fetchAll.useQuery({
        perPage: Number.MAX_SAFE_INTEGER,
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Modal.Title className="font-bold mb-2" as="h6">
                Přidej nástroj do sekce
            </Modal.Title>
            <div className="flex flex-col gap-2">
                {data &&
                    data.payload.map((grouping, idx) => {
                        return (
                            <Button
                                type="button"
                                key={idx}
                                className="w-full flex flex-row justify-between shadow-none border-2"
                                onClick={() => onAdd(grouping)}
                            >
                                <span>{grouping.name}</span>
                            </Button>
                        );
                    })}
            </div>
        </Modal>
    );
}
