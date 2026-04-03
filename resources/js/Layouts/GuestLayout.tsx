import { Head } from '@inertiajs/react';

interface Props {
    title?: string;
    children: React.ReactNode;
}

export default function GuestLayout({ title, children }: Props) {
    return (
        <>
            {title && <Head title={title} />}
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-lg">
                            P
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">PAPAN</h1>
                        <p className="text-sm text-muted-foreground">Pusat Arsip Persediaan & Aset Niaga</p>
                    </div>
                    {children}
                </div>
            </div>
        </>
    );
}
