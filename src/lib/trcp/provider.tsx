'use client';

import { type ReactNode, useState } from 'react';
import trpc from '@/lib/trcp/client';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import env from '@/env.mjs';

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
                    refetchOnReconnect: false,
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
