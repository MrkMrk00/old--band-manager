'use client';

import trpc from '@/lib/trcp/trpc';

export function TestElement() {
    const { data } = trpc.getUser.useQuery();

    return <div>:) {data?.display_name }</div>;
}
