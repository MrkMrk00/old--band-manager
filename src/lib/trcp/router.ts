import { Router } from '@/lib/trcp/server';
import InstrumentsRouter from '@/router/entity-crud/instruments';
import SongsRouter from '@/router/entity-crud/songs';
import UsersRouter from '@/router/entity-crud/users';

const entityRouters = {
    instruments: InstrumentsRouter,
    users: UsersRouter,
    songs: SongsRouter,
};

const router = Router(entityRouters);

export default router;
