import type { HeaderMapping, ObjectType } from '@/view/list/types';

export const instrument = {
    icon: { title: '', className: 'w-1/4' },
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
    groupings: { title: 'Sekce' },
} satisfies HeaderMapping<ObjectType>;

export const instrumentGrouping = {
    name: { title: 'Název' },
    created_at: { title: 'Vytvořeno' },
    admin_name: { title: 'Přidal admin' },
} satisfies HeaderMapping<ObjectType>;

export const user = {
    display_name: { title: 'Přezdívka', className: 'max-w-1/4' },
    login: { title: '', className: 'max-w-1/8' },
    created_at: { title: 'Zaregistrován', className: 'max-w-1/4' },
    roles: { title: 'Role', className: 'max-w-3/8 text-sm group-[.header]:text-base text-center' },
} satisfies HeaderMapping<ObjectType>;

export const songs = {
    number: { title: 'Číslo' },
    name: { title: 'Název' },
    created_by: { title: 'Přidal', className: 'text-sm group-[.header]:text-base' },
} satisfies HeaderMapping<ObjectType>;
