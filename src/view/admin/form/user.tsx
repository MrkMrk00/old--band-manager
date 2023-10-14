'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { admin } from '@/lib/route-register';
import trpc from '@/lib/trcp/client';
import { EntityForm, RequiredStar } from '@/view/form/shared';
import yoink from '@/view/form/yoink';
import { Button, Input, LoadingSpinner } from '@/view/layout';

function useRegisterUser() {
    const router = useRouter();
    const {
        data: newId,
        mutate,
        error,
        isError,
        reset,
        isSuccess,
        isLoading,
    } = trpc.users.register.useMutation();

    function onSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();

        mutate(yoink(ev.currentTarget) as Parameters<typeof mutate>[0]);
    }

    if (isError) {
        toast.error(error.message);
        reset();
    }

    if (isSuccess) {
        router.push(admin().show('users', newId).build());
    }

    return {
        onSubmit,
        isSaving: isLoading,
    };
}

export default function RegisterNewUser() {
    const { onSubmit, isSaving } = useRegisterUser();

    return (
        <EntityForm onSubmit={onSubmit}>
            <EntityForm.Header>Zaregistruj nového uživatele</EntityForm.Header>

            <EntityForm.Row>
                <label htmlFor="input-display_name">
                    Přezdívka
                    <RequiredStar />
                </label>
                <Input
                    id="input-display_name"
                    placeholder="Jan Novák"
                    name="display_name"
                    required
                />
            </EntityForm.Row>

            <hr />

            <EntityForm.Row>
                <label htmlFor="input-email">
                    E-mail
                    <RequiredStar />
                </label>
                <Input
                    type="email"
                    id="input-email"
                    placeholder="jan@novak.cz"
                    name="email"
                    required
                />
            </EntityForm.Row>

            <hr />

            <EntityForm.Row>
                <label htmlFor="input-password">
                    Heslo
                    <RequiredStar />
                </label>
                <Input
                    type="password"
                    id="input-password"
                    min="6"
                    placeholder="******"
                    name="password"
                    required
                />
            </EntityForm.Row>

            <hr />

            <EntityForm.Row className="py-4">
                <Button type="submit" className="bg-green-300">
                    {isSaving ? <LoadingSpinner color="black" size="1.2em" /> : 'Registrovat'}
                </Button>
            </EntityForm.Row>
        </EntityForm>
    );
}
