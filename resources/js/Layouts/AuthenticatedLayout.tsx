import { PropsWithChildren, ReactNode } from 'react';

import Navbar from '@/Components/Navbar';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto flex max-w-7xl justify-between px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                        <div>Sort by</div>
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
