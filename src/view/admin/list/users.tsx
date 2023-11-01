import { ListProps, Pager, getListUtils } from './common';
import dayjs from 'dayjs';
import Link from 'next/link';
import { admin } from '@/lib/route-register';
import { List } from '@/view/list';

export default async function UsersList({ page, refetch }: ListProps) {
    const utils = getListUtils('users', page, refetch);

    const { maxPage, queryBuilder } = await utils.repository.paged(page > 0 ? page : 1);

    const users = await queryBuilder.select(['id', 'display_name', 'created_at']).execute();

    return (
        <>
            <List>
                <List.Header>
                    <List.Value className="justify-start">Číslo</List.Value>
                    <List.Value>Přezdívka</List.Value>
                    <List.Value>Registrován</List.Value>
                </List.Header>
                {users.map((user, i) => (
                    <Link key={i} href={admin().show('users', user.id).build()}>
                        <List.Row>
                            <List.Value className="justify-start">{user.id}</List.Value>

                            <List.Value>{user.display_name}</List.Value>

                            <List.Value className="text-sm">
                                {dayjs(user.created_at).format('DD.MM.YY')}
                            </List.Value>
                        </List.Row>
                    </Link>
                ))}
            </List>
            {maxPage !== 1 && (
                <div className="flex flex-row w-100 justify-center">
                    <Pager maxPage={maxPage} page={page} href={utils.url} />
                </div>
            )}
        </>
    );
}
