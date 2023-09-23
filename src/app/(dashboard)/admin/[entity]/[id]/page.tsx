import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { Database } from '@/database';
import { admin } from '@/lib/route-register';
import { Link } from '@/view/layout';

const InstrumentForm = dynamic(() => import('@/view/form/entity/instrument'));
const GroupingForm = dynamic(() => import('@/view/form/entity/instrument_grouping'));
const UserForm = dynamic(() => import('@/view/form/entity/user'));

type PageProps = {
    searchParams: {
        back_ref?: string;
    };
    params: {
        id: string;
        entity: string;
    };
};

export default async function FormView({ searchParams, params: { entity, id } }: PageProps) {
    entity = entity.replace('-', '_');

    const backUrl =
        searchParams.back_ref ??
        admin()
            .list(entity as keyof Database)
            .build();

    if ((id === '' || isNaN(+id)) && id !== 'add') {
        redirect(backUrl);
    }

    return (
        <div className="max-w-2xl w-full flex flex-col items-center gap-5">
            <div className="flex flex-row w-full">
                <Link
                    href={backUrl}
                    className="inline-flex flex-row justify-center items-center bg-green-300"
                >
                    <FaArrowLeftLong size="1em" />
                    &emsp;Zpět
                </Link>
            </div>
            {entity === 'instruments' && (
                <InstrumentForm key="instruments" id={id as `${number}` | 'add'} />
            )}

            {entity === 'instrument_groupings' && (
                <GroupingForm key="groupings" id={id as `${number}` | 'add'} />
            )}

            {entity === 'users' && <UserForm key="user" />}
        </div>
    );
}
