import { Router } from '@/lib/trcp/server';
import InstrumentsRouter from '@/lib/router/instruments';
import UsersRouter from '@/lib/router/users';

const router = Router({
    instruments: InstrumentsRouter,
    users: UsersRouter,
});

export default router;
