import { useState } from 'react';
import { BarangImage } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    images: BarangImage[];
}

export default function ImageGallery({ images }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                <svg className="h-24 w-24 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
            </div>
        );
    }

    const mainImage = images[activeIndex];

    return (
        <div className="space-y-3">
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                <img
                    src={`/storage/${mainImage.path}`}
                    alt="Product"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, index) => (
                        <button
                            key={img.id}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                                index === activeIndex
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            <img
                                src={`/storage/${img.path}`}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
