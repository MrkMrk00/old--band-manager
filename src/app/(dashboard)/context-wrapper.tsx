'use client';

import type { UserObject } from '@/model/user';
import { UserContext, wrapUserCS } from '@/view/context';
import type { ReactNode } from 'react';

export default function ContextWrapper({
    children,
    user,
}: {
    children?: ReactNode;
    user: UserObject;
}) {
    return <UserContext.Provider value={wrapUserCS(user)}>{children}</UserContext.Provider>;
}
