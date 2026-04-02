import { Head, Link, router } from '@inertiajs/react';
import { usePageProps } from '@/hooks/use-page-props';

interface Props {
    status: number;
}

const errors: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses Ditolak',
        description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        description: 'Halaman yang Anda cari tidak ada atau telah dipindahkan.',
    },
    500: {
        title: 'Terjadi Kesalahan',
        description: 'Server mengalami masalah. Silakan coba lagi nanti.',
    },
    503: {
        title: 'Layanan Tidak Tersedia',
        description: 'Server sedang dalam pemeliharaan. Silakan coba lagi nanti.',
    },
};

function ErrorIcon({ status }: { status: number }) {
    if (status === 403) {
        return (
            <svg className="mx-auto h-16 w-16 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
        );
    }
    if (status === 404) {
        return (
            <svg className="mx-auto h-16 w-16 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
        );
    }
    return (
        <svg className="mx-auto h-16 w-16 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
    );
}

export default function Error({ status }: Props) {
    const { pengaturan } = usePageProps<Props>();
    const error = errors[status] || errors[500];
    const logoUrl = pengaturan?.logo ? `/storage/${pengaturan.logo}` : null;
    const companyName = pengaturan?.nama_perusahaan || 'PAPAN';

    return (
        <>
            <Head title={`${status} - ${error.title}`} />

            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
                {/* Background pattern */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-muted/40 via-background to-background" />

                <div className="relative z-10 w-full max-w-md text-center">
                    {/* Company branding */}
                    <div className="mb-8 flex items-center justify-center gap-2.5">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={companyName}
                                className="h-10 w-10 rounded-xl object-contain"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                                P
                            </div>
                        )}
                        <span className="text-lg font-semibold text-foreground">{companyName}</span>
                    </div>

                    {/* Error status code */}
                    <div className="mb-6 select-none text-8xl font-bold text-muted-foreground/20">
                        {status}
                    </div>

                    {/* Icon */}
                    <div className="mb-4">
                        <ErrorIcon status={status} />
                    </div>

                    {/* Error info */}
                    <h1 className="mb-2 text-2xl font-bold text-foreground">{error.title}</h1>
                    <p className="mb-8 text-muted-foreground">{error.description}</p>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Kembali
                        </button>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
