import { Router } from '@/lib/trcp/server';
import InstrumentsRouter from '@/router/instruments';
import UsersRouter from '@/router/users';

const router = Router({
    instruments: InstrumentsRouter,
    users: UsersRouter,
});

export default router;
