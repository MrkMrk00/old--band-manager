'use client';

import env from '@/env.mjs';

import trpc from '@/lib/trcp/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import dynamic from 'next/dynamic';
import { type ReactNode, useState } from 'react';

const ReactQueryDevtools = dynamic(() =>
    import('@tanstack/react-query-devtools').then(i => i.ReactQueryDevtools),
);

type TRPCProps = {
    children?: ReactNode;
};

export function TRPCProvider(props: TRPCProps) {
    const { children } = props;

    const [queryClient] = useState(() => {
        return new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 10000,
                    refetchInterval: false,
                    refetchOnReconnect: true,
                    refetchOnWindowFocus: false,
                },
            },
        });
    });

    const url = env.NEXT_PUBLIC_DOMAIN + 'api/trpc';

    const [trpcClient] = useState(() => {
        return trpc.createClient({
            links: [
                loggerLink({ enabled: () => env.NEXT_PUBLIC_ENV === 'development' }),
                httpBatchLink({
                    url,
                }),
            ],
        });
    });

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
                {env.NEXT_PUBLIC_ENV === 'development' && <ReactQueryDevtools />}
            </QueryClientProvider>
        </trpc.Provider>
    );
}
