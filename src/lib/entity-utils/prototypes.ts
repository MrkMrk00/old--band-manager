import type { Instrument } from '@/model/instruments';

const instrumentProto = {
    getGroupingIds(): number[] {
        if (!('groupings' in this) || typeof this.groupings !== 'string') {
            return [];
        }

        return JSON.parse(this.groupings);
    }
};

export function toInstrument(instrument: Instrument): Instrument & typeof instrumentProto {
    if (Object.getPrototypeOf(instrument) === instrumentProto) {
        return instrument as Instrument  & typeof instrumentProto;
    }

    return Object.setPrototypeOf(instrument, instrumentProto);
}