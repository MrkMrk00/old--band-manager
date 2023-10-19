'use client';

import type { ReactNode } from "react";
import type { UserObject } from "@/model/user";
import { UserContext, wrapUserCS } from '@/view/context';

export default function ContextWrapper({ children, user }: { children?: ReactNode, user: UserObject }) {
    return (
        <UserContext.Provider value={wrapUserCS(user)}>
            { children }
        </UserContext.Provider>
    );
}
