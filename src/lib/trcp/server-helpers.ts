import { createServerSideHelpers } from '@trpc/react-query/dist/server';
import { createContext } from '@/lib/trcp/context';
import router from '@/lib/trcp/router';

export const helpers = createServerSideHelpers({
    router,
    ctx: await createContext(),
});
