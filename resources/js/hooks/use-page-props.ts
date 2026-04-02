import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function usePageProps<T = Record<string, unknown>>() {
    return usePage<PageProps & T>().props;
}

export function useAuth() {
    const { auth } = usePageProps();
    return auth;
}

export function useFlash() {
    const { flash } = usePageProps();
    return flash;
}
