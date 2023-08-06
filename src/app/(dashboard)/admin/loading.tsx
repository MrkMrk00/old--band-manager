import { LoadingSpinner } from '@/view/layout';

export default function Loading() {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <LoadingSpinner color="black" size="3em" />
        </div>
    );
}