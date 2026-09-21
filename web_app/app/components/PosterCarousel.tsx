'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Movie } from '@/lib/models/Movie';
import { Page } from '@/lib/models/Page';
import PosterItem from '@/app/ui/PosterItem';

interface PosterCarouselProps {
    title: string;
    /** Full gateway url. A page/limit query is appended. */
    url: string;
    size?: 'small' | 'medium' | 'large';
}

const fetcher = async (url: string): Promise<Page<Movie>> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return res.json();
};

/**
 * A Netflix-style poster row that wraps around instead of stopping at the ends.
 *
 * The loop works by rendering the same items three times and keeping the
 * scroll position inside the middle copy. When a scroll crosses into the first
 * or last copy the position is shifted by exactly one copy's width, with
 * smooth scrolling suppressed, so the content under the cursor does not move —
 * the row just never runs out in either direction.
 */
export default function PosterCarousel({ title, url, size = 'small' }: PosterCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const repositioning = useRef(false);
    const [ready, setReady] = useState(false);

    const { data, isLoading, error } = useSWR<Page<Movie>>(
        `${url}${url.includes('?') ? '&' : '?'}page=0&limit=20`,
        fetcher,
    );

    const items = data?.content ?? [];
    const canLoop = items.length > 2;
    // Three copies: one to scroll back into, one to sit in, one to scroll forward into.
    const rendered = canLoop ? [...items, ...items, ...items] : items;

    /** Width of a single copy of the list. */
    const copyWidth = useCallback(() => {
        const track = trackRef.current;
        return track ? track.scrollWidth / 3 : 0;
    }, []);

    // Start in the middle copy so there is room to scroll both ways.
    useEffect(() => {
        const track = trackRef.current;
        if (!track || !canLoop || ready) return;
        const width = copyWidth();
        if (width === 0) return;
        track.scrollLeft = width;
        setReady(true);
    }, [canLoop, copyWidth, ready, items.length]);

    const onScroll = useCallback(() => {
        const track = trackRef.current;
        if (!track || !canLoop || repositioning.current) return;

        const width = copyWidth();
        if (width === 0) return;

        // Jump a whole copy so the pixels under the pointer are identical.
        if (track.scrollLeft < width * 0.5) {
            repositioning.current = true;
            track.scrollLeft += width;
            repositioning.current = false;
        } else if (track.scrollLeft > width * 1.5) {
            repositioning.current = true;
            track.scrollLeft -= width;
            repositioning.current = false;
        }
    }, [canLoop, copyWidth]);

    const page = (direction: -1 | 1) => {
        const track = trackRef.current;
        if (!track) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        track.scrollBy({
            left: direction * track.clientWidth * 0.8,
            behavior: reduced ? 'auto' : 'smooth',
        });
    };

    if (isLoading) {
        return (
            <section className="flex flex-col gap-2 py-4">
                <h2 className="px-4 text-xl font-medium text-white">{title}</h2>
                <div className="h-[300px] animate-pulse bg-gray-800" />
            </section>
        );
    }

    // A row that cannot load should leave a gap, not break the page.
    if (error || items.length === 0) return null;

    return (
        <section className="group relative flex flex-col gap-2 py-4" aria-label={title}>
            <h2 className="px-4 text-xl font-medium text-white">{title}</h2>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => page(-1)}
                    aria-label={`Scroll ${title} backwards`}
                    className="absolute left-0 top-0 z-10 h-full w-12 cursor-pointer bg-gradient-to-r from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                    <ChevronLeft className="text-white" fontSize="large" />
                </button>

                <div
                    ref={trackRef}
                    onScroll={onScroll}
                    className="flex gap-2 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {rendered.map((movie, index) => (
                        <div
                            key={`${movie.id}-${index}`}
                            className="shrink-0"
                            // Only the middle copy is announced; the other two are
                            // duplicates that exist to make the loop seamless.
                            aria-hidden={canLoop && (index < items.length || index >= items.length * 2)}
                        >
                            <PosterItem item={movie} size={size} />
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => page(1)}
                    aria-label={`Scroll ${title} forwards`}
                    className="absolute right-0 top-0 z-10 h-full w-12 cursor-pointer bg-gradient-to-l from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                    <ChevronRight className="text-white" fontSize="large" />
                </button>
            </div>
        </section>
    );
}
