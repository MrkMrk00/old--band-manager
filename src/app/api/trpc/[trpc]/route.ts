import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';
import { createContext } from '@/lib/trcp/context';
import router from '@/lib/trcp/router';

function allHandler(req: NextRequest) {
    const endpoint = '/api/trpc';

    return fetchRequestHandler({ endpoint, req, router, createContext });
}

export { allHandler as GET, allHandler as POST };
