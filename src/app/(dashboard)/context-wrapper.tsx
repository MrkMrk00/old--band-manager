'use client';

import type { ReactNode } from 'react';
import { UserContext, wrapUserCS } from '@/view/context';
import type { UserObject } from '@/model/user';

export default function ContextWrapper({
    children,
    user,
}: {
    children?: ReactNode;
    user: UserObject;
}) {
    return <UserContext.Provider value={wrapUserCS(user)}>{children}</UserContext.Provider>;
}
