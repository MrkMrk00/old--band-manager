import { Router } from '@/lib/trcp/server';
import InstrumentsRouter from '@/router/instruments';
import UsersRouter from '@/router/users';
import SongsRouter from '@/router/songs';

const entityRouters = {
    instruments: InstrumentsRouter,
    users: UsersRouter,
    songs: SongsRouter,
};

const router = Router(entityRouters);

export default router;
