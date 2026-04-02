/// <reference types="vite/client" />

declare module 'ziggy-js' {
    export function route(name: string, params?: Record<string, unknown>, absolute?: boolean): string;
}

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}
