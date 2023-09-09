import trpc from '@/lib/trcp/client';
import { Modal } from '@/view/layout-stateful';
import { InstrumentGrouping } from '@/model/instrument_groupings';
import { Button } from '@/view/layout';

export type PickerProps = {
    isOpen: boolean;
    onClose: () => unknown;
    onAdd: (grouping: InstrumentGrouping) => unknown;
};

export default function InstrumentGroupingPicker({ isOpen, onClose, onAdd }: PickerProps) {
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

            {data &&
                data.payload.map((grouping, idx) => {
                    return (
                        <Button
                            type="button"
                            key={idx}
                            className="w-full flex flex-row justify-between shadow-none border-2"
                        >
                            <span>{grouping.name}</span>
                            <span>ioaushd</span>
                        </Button>
                    );
                })}
        </Modal>
    );
}
