import { ListProps, Pager, getListUtils } from './common';
import { query } from '@/lib/repositories';
import { List } from '@/view/list';

export default async function InstrumentsList({ refetch, page }: ListProps) {
    const utils = getListUtils('instruments', page, refetch);

    const { maxPage, queryBuilder } = await utils.repository.paged(page);

    const instruments = await queryBuilder.select(['id', 'name', 'created_at']).execute();

    const instrumentsIds = instruments.map(i => i.id);

    const groupingsRaw = await query()
        .selectFrom('instrument_groupings as ig')
        .leftJoin('instruments_groupings_relations as igr', 'igr.id_grouping', 'ig.id')
        .select(['ig.name', 'igr.id_instrument'])
        .where('igr.id_instrument', 'in', instrumentsIds)
        .execute();

    const groupings = new Map<number, string[]>();
    for (const grouping of groupingsRaw as { id_instrument: number; name: string }[]) {
        if (!groupings.has(grouping.id_instrument)) {
            groupings.set(grouping.id_instrument, []);
        }

        groupings.get(grouping.id_instrument)!.push(grouping.name);
    }

    return (
        <>
            <List>
                <List.Header>
                    <List.Value>Název</List.Value>
                    <List.Value>Vytvořen</List.Value>
                    <List.Value>Sekce</List.Value>
                </List.Header>
                <List.Row></List.Row>
            </List>
            {maxPage !== 1 && <Pager maxPage={maxPage} page={page} href={utils.url} />}
        </>
    );
}
