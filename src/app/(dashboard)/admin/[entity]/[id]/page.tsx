import { redirect } from 'next/navigation';
import { Link } from '@/view/layout';
import { FaArrowLeftLong } from 'react-icons/fa6';
import dynamic from 'next/dynamic';

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
    const backUrl = searchParams.back_ref ?? `/admin/${entity}`;

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

            {entity === 'users' && <UserForm key="user"  />}
        </div>
    );
}
