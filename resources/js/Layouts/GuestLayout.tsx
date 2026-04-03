import { Head, usePage } from '@inertiajs/react';

interface Props {
    title?: string;
    children: React.ReactNode;
}

export default function GuestLayout({ title, children }: Props) {
    const { props } = usePage();
    const pengaturan = (props as any).pengaturan;
    const companyName = pengaturan?.nama_perusahaan || 'PAPAN';
    const companyLogo = pengaturan?.logo ? `/storage/${pengaturan.logo}` : null;

    return (
        <>
            {title && <Head title={title} />}
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        {companyLogo ? (
                            <img src={companyLogo} alt={companyName} className="mx-auto mb-4 h-14 w-14 rounded-2xl object-contain shadow-lg" />
                        ) : (
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-lg">
                                {companyName.charAt(0)}
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-foreground">{companyName}</h1>
                    </div>
                    {children}
                </div>
            </div>
        </>
    );
}
