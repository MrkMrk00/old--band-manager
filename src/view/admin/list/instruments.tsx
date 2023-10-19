import getRepositoryFor from "@/lib/repositories";
import { ListProps } from "./common";
import { admin } from "@/lib/route-register";
import { redirect } from "next/navigation";
import { List } from "@/view/list";

const SELF = admin().list('instruments');

export default async function InstrumentsList({ refetch, page }: ListProps) {
    if (refetch) {
        redirect(SELF.addSearchParam('page', page.toString()).build());
    }

    const repo = getRepositoryFor('instruments');
    const { maxPage, queryBuilder } = await repo.paged(page);

    const instruments = queryBuilder.selectAll().execute();

    return (
        <>
            <List>

            </List>
        </>
    );
}
