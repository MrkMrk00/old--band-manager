import type RootRouter from '@/lib/trcp/router';
import { createTRPCReact } from '@trpc/react-query';

const trpc = createTRPCReact<typeof RootRouter>();

export default trpc;
