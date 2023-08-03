'use client';

import { type ReactNode, useState } from 'react';
import trpc from '@/lib/trcp/client';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getSessionCookie } from '@/view/client.helpers';
import env from '@/env.mjs';

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

    const url = env.NEXT_PUBLIC_DOMAIN + 'api/trpc';

    const [trpcClient] = useState(() => {
        return trpc.createClient({
            links: [
                loggerLink({ enabled: () => true }),
                httpBatchLink({
                    url,
                    headers: () => {
                        const sessionCookie = getSessionCookie();
                        if (sessionCookie) {
                            return { 'X-TOKEN': sessionCookie };
                        }

                        return {};
                    },
                }),
            ],
        });
    });

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
                <ReactQueryDevtools />
            </QueryClientProvider>
        </trpc.Provider>
    );
}
