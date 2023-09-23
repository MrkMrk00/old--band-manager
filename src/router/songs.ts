import { Pageable, Pager } from '@/lib/pager';
import { query } from '@/lib/repositories';
import { countAll } from '@/lib/specs';
import { Authenticated, Router } from '@/lib/trcp/server';

const fetchAll = Authenticated.input(Pager.input).query(async function ({ input, ctx }) {
    const allCount = await countAll('songs');
    const { maxPage, offset } = Pager.query(allCount, input.perPage, input.page);

    const songs = await query()
        .selectFrom('songs')
        .selectAll()
        .offset(offset)
        .limit(input.perPage)
        .execute();

    return {
        maxPage: maxPage,
        payload: songs,
    } satisfies Pageable<(typeof songs)[0]>;
});

export default Router({
    fetchAll,
});
