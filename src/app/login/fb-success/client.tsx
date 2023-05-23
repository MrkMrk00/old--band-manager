'use client';

import { Button } from '@/lib/layout';

export function CloseButton() {
    return (
        <Button className="lg:w-1/4 w-1/2 text-white" onClick={() => window.close()}>Close</Button>
    );
}