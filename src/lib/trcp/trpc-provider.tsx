'use client';

import { type ReactNode, useState } from 'react';
import env from '@/env.mjs';
import trpc from '@/lib/trcp/trpc';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

type TRPCProps = {
    children?: ReactNode;
};

export function TRPCProvider(props: TRPCProps) {
    const { children } = props;

    const [queryClient] = useState(() => {
        return new QueryClient({
            defaultOptions: { queries: { staleTime: 5000 } },
        });
    });

    const url = env.NEXT_PUBLIC_DOMAIN;

    const [trpcClient] = useState(() => {
        return trpc.createClient({
            links: [
                loggerLink({ enabled: () => true }),
                httpBatchLink({ url }),
            ],
        });
    });

    return (
        // @ts-ignore :) happy
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                { children }
                <ReactQueryDevtools />
            </QueryClientProvider>
        </trpc.Provider>
    );
}