import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from '@/lib/trcp/trpc-router';

const trpc = createTRPCReact<AppRouter>();

export default trpc;