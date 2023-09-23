import { Router } from '@/lib/trcp/server';
import InstrumentsRouter from '@/router/instruments';
import SongsRouter from '@/router/songs';
import UsersRouter from '@/router/users';

const entityRouters = {
    instruments: InstrumentsRouter,
    users: UsersRouter,
    songs: SongsRouter,
};

const router = Router(entityRouters);

export default router;
