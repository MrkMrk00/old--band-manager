import { Router } from '@/lib/trcp/server';
import InstrumentsRouter from '@/router/instruments';
import UsersRouter from '@/router/users';

const entityRouters = {
    instruments: InstrumentsRouter,
    users: UsersRouter,
};

export type EntityRouters = keyof typeof entityRouters;
export type EntityRouterMethods = 'fetchAll' | 'one' | 'upsert' | 'delete';
export type EntityRouterDef = {
    [must in EntityRouterMethods]: any;
} & { [key: string | number | symbol]: any };

const router = Router(entityRouters);

export default router;
