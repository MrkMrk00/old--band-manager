'use client';

import Modal, { Button, If, Input, LoadingSpinner } from '@/view/layout';
import Image from 'next/image';
import fbLogo from '@/assets/fb_logo_250.png';
import { FormEvent, ReactNode, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import trpc from '@/lib/trcp/client';
import toast from 'react-hot-toast';

function SectionRow(props: { children?: ReactNode; className?: string }) {
    return (
        <div className={twMerge('flex flex-row gap-3 items-center px-5', props.className)}>
            {props.children}
        </div>
    );
}

export default function UserDetailsForm() {
    const { data: user, refetch } = trpc.users.me.useQuery();
    const mutation = trpc.users.update.useMutation();
    const formRef = useRef(null);

    const [hasMutated, setHasMutated] = useState(false);
    const [showModal, setShowModal] = useState(false);

    function handleFormSubmit(ev: FormEvent) {
        ev.preventDefault();
        setShowModal(true);
    }

    function handleCloseModal(a: number | undefined) {
        setShowModal(false);

        if (a === 1) {
            const data = Object.fromEntries(new FormData(formRef.current!));
            mutation.mutate(data as { display_name: string });
            setHasMutated(true);
            refetch();
            return;
        }
    }

    if (hasMutated && mutation.isSuccess) {
        toast.success(
            'Povedlo se!\nPro správné zobrazení nových údajů bude možná potřeba se odhlásit a znovu přihlásit. :)',
        );

        setHasMutated(false);
    }

    if (hasMutated && mutation.isError) {
        toast.error('Stala se chyba!', {
            className: 'bg-green-400',
        });

        setHasMutated(false);
    }

    return (
        <form
            ref={formRef}
            method="POST"
            className="flex flex-col gap-4 w-full rounded-xl border shadow h-[250px]"
            onSubmit={handleFormSubmit}
        >
            <Modal
                title="Opravdu?"
                isOpen={showModal}
                onClose={handleCloseModal}
                buttons={[
                    { id: 2, className: 'border', children: 'Tak ne, no', rightSide: true },
                    { id: 1, className: 'bg-blue-200', children: 'Fakt, myslím to vážně!' },
                ]}
            >
                Opravdu chceš měnit svoje osobní údaje?
            </Modal>

            <h3 className="font-bold text-xl border-b px-4 p-2 rounded-t-xl bg-slate-200">O mně</h3>
            <div className="flex flex-col gap-4 w-full">
                <If condition={!user}>
                    <div className="flex flex-row justify-center items-center w-full">
                        <LoadingSpinner color="black" />
                    </div>
                </If>
                {!!user && (
                    <>
                        <SectionRow>
                            <label className="w-32" htmlFor="displayName">
                                Přezdívka
                            </label>
                            <Input
                                name="display_name"
                                id="displayName"
                                defaultValue={user!.display_name}
                            />
                        </SectionRow>
                        <hr />

                        <SectionRow>
                            <span className="w-32">Zdroj přihlášení</span>
                            <If condition={user?.fb_id !== null}>
                                <div title={`Id: ${user!.fb_id}`} className="flex flex-row gap-2">
                                    <Image src={fbLogo} alt="Facebook logo" height={24} /> Facebook
                                </div>
                            </If>

                            <If condition={user?.email !== null}>
                                <div className="flex flex-row gap-2 items-center">
                                    <strong className="text-[24px]">@</strong>
                                    <span>E-mail</span>
                                </div>
                            </If>
                        </SectionRow>
                        <hr />

                        <SectionRow className="justify-end">
                            <Button className="bg-green-400" type="submit">
                                Uložit
                            </Button>
                        </SectionRow>
                        <span />
                    </>
                )}
            </div>
        </form>
    );
}
