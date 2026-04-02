import { Link } from '@inertiajs/react';
import { PaginationLink } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    links: PaginationLink[];
}

export default function Pagination({ links }: Props) {
    if (links.length <= 3) return null;

    return (
        <nav className="flex items-center justify-center gap-1">
            {links.map((link, i) => {
                const label = link.label
                    .replace('&laquo;', '\u00AB')
                    .replace('&raquo;', '\u00BB')
                    .replace('Previous', 'Sebelumnya')
                    .replace('Next', 'Selanjutnya');

                if (!link.url) {
                    return (
                        <span
                            key={i}
                            className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url}
                        className={cn(
                            'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm transition-colors',
                            link.active
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-muted'
                        )}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </nav>
    );
}
