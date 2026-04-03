import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
    title: (title) => {
        const appName = (window as any).__PAPAN_APP_NAME || 'PAPAN';
        return title ? `${title} - ${appName}` : appName;
    },
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        // Extract company name from initial props for browser tab title
        const pengaturan = (props.initialPage.props as any).pengaturan;
        if (pengaturan?.nama_perusahaan) {
            (window as any).__PAPAN_APP_NAME = pengaturan.nama_perusahaan;
        }

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#2563eb',
    },
});
