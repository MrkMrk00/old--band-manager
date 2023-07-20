import { createTRPCReact } from '@trpc/react-query';
import type RootRouter from '@/lib/trcp/router';

const trpc = createTRPCReact<typeof RootRouter>();

export default trpc;
