import { FormEvent, useRef, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShortcutSettings from '@/Components/ShortcutSettings';
import { usePageProps } from '@/hooks/use-page-props';

type TabKey = 'umum' | 'keamanan' | 'backup' | 'shortcuts';

const tabDefs: { key: TabKey; label: string; icon: string }[] = [
    {
        key: 'umum',
        label: 'Umum',
        icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
        key: 'keamanan',
        label: 'Keamanan',
        icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    },
    {
        key: 'backup',
        label: 'Backup',
        icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
    },
    {
        key: 'shortcuts',
        label: 'Shortcuts',
        icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z',
    },
];

export default function PengaturanIndex() {
    const { pengaturan } = usePageProps();
    const [activeTab, setActiveTab] = useState<TabKey>('umum');
    const [logoPreview, setLogoPreview] = useState<string | null>(
        pengaturan?.logo ? `/storage/${pengaturan.logo}` : null
    );

    // General form
    const umumForm = useForm({
        nama_perusahaan: pengaturan?.nama_perusahaan || '',
        alamat: pengaturan?.alamat || '',
        telepon: pengaturan?.telepon || '',
        logo: null as File | null,
        sandi_void: '',
        poin_min_belanja: pengaturan?.poin_min_belanja || 0,
        poin_dapat: pengaturan?.poin_dapat || 0,
        enable_shift: pengaturan?.enable_shift || false,
    });

    // Security form
    const securityForm = useForm({
        nama_perusahaan: pengaturan?.nama_perusahaan || '',
        alamat: pengaturan?.alamat || '',
        telepon: pengaturan?.telepon || '',
        sandi_void: '',
        poin_min_belanja: pengaturan?.poin_min_belanja || 0,
        poin_dapat: pengaturan?.poin_dapat || 0,
        enable_shift: pengaturan?.enable_shift || false,
    });

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            umumForm.setData('logo', file);
            const reader = new FileReader();
            reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function submitUmum(e: FormEvent) {
        e.preventDefault();
        umumForm.post('/pengaturan', { forceFormData: true });
    }

    function submitSecurity(e: FormEvent) {
        e.preventDefault();
        securityForm.post('/pengaturan', { forceFormData: true });
    }

    const inputClass =
        'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

    return (
        <AuthenticatedLayout
            title="Pengaturan"
            header={<h1 className="text-lg font-semibold text-foreground">Pengaturan</h1>}
        >
            <div className="mx-auto max-w-2xl">
                <div className="rounded-xl border border-border bg-card">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-border">
                        {tabDefs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                                </svg>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* TAB: UMUM */}
                        {activeTab === 'umum' && (
                            <form onSubmit={submitUmum} className="space-y-6">
                                {/* Logo */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Logo</label>
                                    <div className="flex items-center gap-4">
                                        {logoPreview && (
                                            <img
                                                src={logoPreview}
                                                alt="Logo"
                                                className="h-16 w-16 rounded-lg border border-border object-contain"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
                                        />
                                    </div>
                                    {umumForm.errors.logo && (
                                        <p className="mt-1 text-xs text-destructive">{umumForm.errors.logo}</p>
                                    )}
                                </div>

                                {/* Company Info */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Perusahaan</label>
                                    <input
                                        type="text"
                                        value={umumForm.data.nama_perusahaan}
                                        onChange={(e) => umumForm.setData('nama_perusahaan', e.target.value)}
                                        className={inputClass}
                                    />
                                    {umumForm.errors.nama_perusahaan && (
                                        <p className="mt-1 text-xs text-destructive">{umumForm.errors.nama_perusahaan}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">Alamat</label>
                                        <textarea
                                            value={umumForm.data.alamat}
                                            onChange={(e) => umumForm.setData('alamat', e.target.value)}
                                            className={inputClass}
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">Telepon</label>
                                        <input
                                            type="text"
                                            value={umumForm.data.telepon}
                                            onChange={(e) => umumForm.setData('telepon', e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={umumForm.data.enable_shift}
                                        onChange={(e) => umumForm.setData('enable_shift', e.target.checked)}
                                        className="rounded border-border"
                                    />
                                    Aktifkan fitur shift kasir
                                </label>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={umumForm.processing}
                                        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {umumForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TAB: KEAMANAN */}
                        {activeTab === 'keamanan' && (
                            <form onSubmit={submitSecurity} className="space-y-6">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Sandi Void</label>
                                    <input
                                        type="password"
                                        value={securityForm.data.sandi_void}
                                        onChange={(e) => securityForm.setData('sandi_void', e.target.value)}
                                        className={inputClass}
                                        placeholder="Masukkan sandi void baru"
                                    />
                                    {securityForm.errors.sandi_void && (
                                        <p className="mt-1 text-xs text-destructive">{securityForm.errors.sandi_void}</p>
                                    )}
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        Sandi ini digunakan untuk memverifikasi transaksi void. Kosongkan jika tidak ingin mengubah.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={securityForm.processing}
                                        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {securityForm.processing ? 'Menyimpan...' : 'Simpan Sandi'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TAB: BACKUP & RESTORE */}
                        {activeTab === 'backup' && (
                            <div className="space-y-6">
                                {/* Backup */}
                                <div className="rounded-xl border border-border bg-muted/30 p-5">
                                    <h3 className="mb-2 font-semibold text-foreground">Download Backup</h3>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Download file backup database dalam format .sql. Simpan file ini di tempat yang aman.
                                    </p>
                                    <a
                                        href="/pengaturan/backup"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Download Backup
                                    </a>
                                </div>

                                {/* Restore */}
                                <div className="rounded-xl border border-border bg-muted/30 p-5">
                                    <h3 className="mb-2 font-semibold text-foreground">Restore Database</h3>
                                    <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                                        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                            Peringatan: Restore akan menimpa seluruh data yang ada saat ini. Pastikan Anda telah melakukan backup terlebih dahulu.
                                        </p>
                                    </div>
                                    <RestoreForm />
                                </div>
                            </div>
                        )}

                        {/* TAB: SHORTCUTS */}
                        {activeTab === 'shortcuts' && (
                            <ShortcutSettings />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RestoreForm() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, errors } = useForm<{ sql_file: File | null }>({
        sql_file: null,
    });

    function handleRestore(e: FormEvent) {
        e.preventDefault();
        if (!data.sql_file) return;
        if (!confirm('Apakah Anda yakin ingin me-restore database? Semua data saat ini akan ditimpa!')) return;
        post('/pengaturan/restore', { forceFormData: true });
    }

    return (
        <form onSubmit={handleRestore} className="space-y-3">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">File SQL</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".sql"
                    onChange={(e) => setData('sql_file', e.target.files?.[0] || null)}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
                />
                {errors.sql_file && <p className="mt-1 text-xs text-destructive">{errors.sql_file}</p>}
            </div>
            <button
                type="submit"
                disabled={processing || !data.sql_file}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {processing ? 'Memproses...' : 'Restore Database'}
            </button>
        </form>
    );
}
