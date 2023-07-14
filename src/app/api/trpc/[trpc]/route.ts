import type { NextRequest } from 'next/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter as router } from '@/lib/trcp/trpc-router';
import { createContext } from '@/lib/trcp/context';

function allHandler(req: NextRequest) {
    const endpoint = '/api/trpc';

    return fetchRequestHandler({ endpoint, req, router, createContext });
}

export { allHandler as GET, allHandler as POST };
