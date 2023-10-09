import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Database } from '@/database';

const pages = {
    songs: dynamic(() => import('@/view/admin/pages/songs')),
} satisfies { [key in keyof Database]?: ComponentType };

export default pages;
