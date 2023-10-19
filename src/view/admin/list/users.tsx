import getRepositoryFor from "@/lib/repositories";
import { admin } from "@/lib/route-register";
import { List } from "@/view/list";
import dayjs from "dayjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Pager, ListProps } from './common';
import env from '@/env.mjs';

const SELF = admin().list('users');

export default async function UsersList({ page, refetch }: ListProps) {
    const repo = getRepositoryFor('users');

    const { maxPage, queryBuilder } = await repo.paged(page > 0 ? page : 1);
    const users = await queryBuilder.selectAll().execute();

    if (refetch) {
        redirect(admin().list('users').addSearchParam('page', page.toString()).build());
    }

    const selfHref = new URL(SELF.build(), env.NEXT_PUBLIC_DOMAIN);
    console.log(SELF.build());

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
                            <List.Value className="justify-start">
                                {user.id}
                            </List.Value>

                            <List.Value>
                                {user.display_name}
                            </List.Value>

                            <List.Value className="text-sm">
                                {dayjs(user.created_at).format('DD.MM.YY')}
                            </List.Value>
                        </List.Row>
                    </Link>
                ))}
            </List>
            {page !== maxPage && (
                <div className="flex flex-row w-100 justify-center">
                    <Pager maxPage={maxPage} page={page} href={selfHref} />
                </div>
            )}
        </>
    );
}
