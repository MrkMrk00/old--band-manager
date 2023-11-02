import { type ListProps, Pager, getListUtils } from './common';
import { query } from '@/lib/repositories';
import { admin } from '@/lib/route-register';
import type { InstrumentGrouping } from '@/model/instrument_groupings';
import { List } from '@/view/list';
import dayjs from 'dayjs';
import Link from 'next/link';

function GroupingBadge({ grouping: { name, custom_data } }: { grouping: InstrumentGrouping }) {
    return (
        <span
            title={name}
            className="rounded-3xl px-2 py-1 text-sm"
            style={{
                backgroundColor: (custom_data?.color as string)
                    ? (custom_data!.color as string)
                    : 'yellow',
            }}
        >
            {name.at(0)?.toUpperCase()}
        </span>
    );
}

export default async function InstrumentsList({ refetch, page }: ListProps) {
    const utils = getListUtils('instruments', page, refetch);

    const { maxPage, queryBuilder } = await utils.repository.paged(page);

    const instruments = await queryBuilder
        .select(['id', 'name', 'created_at', 'subname'])
        .execute();

    const instrumentsIds = instruments.map(i => i.id);

    const groupingsRaw = await query()
        .selectFrom('instrument_groupings as ig')
        .innerJoin('instruments_groupings_relations as igr', 'igr.id_grouping', 'ig.id')
        .selectAll('ig')
        .select(['igr.id_instrument'])
        .where('igr.id_instrument', 'in', instrumentsIds)
        .execute();

    const groupings = new Map<number, InstrumentGrouping[]>();
    for (const grouping of groupingsRaw) {
        if (!groupings.has(grouping.id_instrument)) {
            groupings.set(grouping.id_instrument, []);
        }

        groupings.get(grouping.id_instrument)!.push(grouping);
    }

    return (
        <>
            <List className="max-w-2xl w-full">
                <List.Header>
                    <List.Value>Název</List.Value>
                    <List.Value>Vytvořen</List.Value>
                    <List.Value>Sekce</List.Value>
                </List.Header>
                {instruments.map((instrument, index) => {
                    const date = dayjs(instrument.created_at);

                    return (
                        <Link href={admin().show('instruments', instrument.id).build()} key={index}>
                            <List.Row>
                                <List.Value>
                                    {instrument.name} {instrument.subname}
                                </List.Value>
                                <List.Value className="text-center">
                                    <small>
                                        {date.format('DD.MM.YY')}
                                        <br />
                                        {date.format('HH:MM')}
                                    </small>
                                </List.Value>
                                <List.Value className="flex flex-row overflow-hidden gap-1">
                                    {groupings.get(instrument.id)?.map((grouping, index) => {
                                        return <GroupingBadge grouping={grouping} key={index} />;
                                    })}
                                </List.Value>
                            </List.Row>
                        </Link>
                    );
                })}
            </List>

            <Pager maxPage={maxPage} page={page} href={utils.url} />
        </>
    );
}
