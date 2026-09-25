'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Movie } from '@/lib/models/Movie';
import { Page } from '@/lib/models/Page';
import PosterItem from '@/app/ui/PosterItem';
import MoviePreview from '@/app/components/MoviePreview';
import Favorite from '@/app/components/actions/Favorite';

interface PosterCarouselProps {
    title: string;
    /** Full gateway url. A page/limit query is appended. */
    url: string;
    /** The full list on the search page, shown as "See all" by the title. */
    seeAllHref?: string;
    size?: 'small' | 'medium' | 'large';
}

/** The navbar's side padding, so titles and the first poster line up with the wordmark. */
const GUTTER = 'px-4 sm:px-6';

/**
 * A round glass arrow over the posters, like the site's chips. Only with a
 * mouse (pointer-fine): touch screens swipe, and an arrow would cover a poster.
 */
const ARROW =
    'absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full ' +
    'bg-black/60 text-white ring-1 ring-inset ring-white/15 backdrop-blur-md transition-[opacity,background-color] ' +
    'hover:bg-[rgba(100,100,100,0.4)] focus-visible:opacity-100 pointer-fine:flex opacity-0 group-hover:opacity-100';

/** More segments than this and the indicator stops saying anything useful. */
const MAX_SEGMENTS = 10;

const fetcher = async (url: string): Promise<Page<Movie>> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return res.json();
};

function RowSkeleton({ title }: { title: string }) {
    return (
        <section className="flex flex-col gap-3 py-4" aria-busy="true" aria-label={`Loading ${title}`}>
            <h2 className={`text-xl font-semibold tracking-tight text-white ${GUTTER}`}>{title}</h2>
            <div className={`flex gap-2 overflow-hidden py-2 ${GUTTER}`}>
                {Array.from({ length: 8 }, (_, n) => (
                    <span key={n} className="h-[300px] w-[200px] shrink-0 animate-pulse rounded-lg bg-white/10" />
                ))}
            </div>
        </section>
    );
}

/**
 * A Netflix-style poster row that wraps around instead of stopping at the ends.
 *
 * The loop works by rendering the same items three times and keeping the scroll
 * position inside the middle copy. When a scroll crosses into the first or last
 * copy the position is shifted by exactly one copy's width, so the content under
 * the cursor does not move — the row just never runs out in either direction.
 *
 * The arrows move by whole posters and land on a poster's edge; on touch
 * screens, swipes snap to posters. The header carries a segment indicator
 * (with a mouse), one segment per screenful of the underlying list.
 */
export default function PosterCarousel({ title, url, seeAllHref, size = 'small' }: PosterCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const repositioning = useRef(false);
    // True while an arrow's smooth scroll runs: moving scrollLeft then would
    // cancel it partway, so the loop doesn't wrap until it ends.
    const animating = useRef(false);
    // Which arrow press is animating, so an earlier press's timeout can't end a later one.
    const pressId = useRef(0);
    // Where the running animation is heading, so a second press moves on from there.
    const heading = useRef(0);
    const [ready, setReady] = useState(false);
    const [activePage, setActivePage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    // The element is kept so the preview can re-measure it on close; the row
    // may have scrolled while it was open.
    const [selected, setSelected] = useState<{ movie: Movie; element: HTMLElement } | null>(null);

    const { data, isLoading, error } = useSWR<Page<Movie>>(
        `${url}${url.includes('?') ? '&' : '?'}page=0&limit=20`,
        fetcher,
    );

    const items = data?.content ?? [];
    const canLoop = items.length > 2;
    // Three copies: one to scroll back into, one to sit in, one to scroll forward into.
    const rendered = canLoop ? [...items, ...items, ...items] : items;

    /** A card's position in the track's scroll coordinates. */
    const positionOf = useCallback((index: number) => {
        const track = trackRef.current;
        const card = track?.children[index] as HTMLElement | undefined;
        if (!track || !card) return 0;
        return card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    }, []);

    /** Width of one card including the gap after it. */
    const cardWidth = useCallback(() => positionOf(1) - positionOf(0), [positionOf]);

    /**
     * Width of a single copy of the list: from the first card to the same
     * card in the next copy, so exactly a whole number of cards. (A third of
     * scrollWidth also counted a third of the side padding.)
     */
    const copyWidth = useCallback(() => {
        if (!canLoop) return trackRef.current?.scrollWidth ?? 0;
        return positionOf(items.length) - positionOf(0);
    }, [canLoop, items.length, positionOf]);

    /** Which screenful of the underlying item list is on show. */
    const updateIndicator = useCallback(() => {
        const track = trackRef.current;
        const card = cardWidth();
        if (!track || card <= 0 || items.length === 0) return;

        const perPage = Math.max(1, Math.floor(track.clientWidth / card));
        const pages = Math.max(1, Math.ceil(items.length / perPage));

        // scrollLeft sits inside the middle copy, so fold it back into the range
        // of a single copy before working out which screenful that is.
        const copy = copyWidth();
        const withinCopy = copy > 0 ? ((track.scrollLeft % copy) + copy) % copy : 0;

        setPageCount(pages);
        setActivePage(Math.floor(withinCopy / card / perPage) % pages);
    }, [cardWidth, copyWidth, items.length]);

    // Start at the first card of the middle copy so there is room to scroll
    // both ways, lined up with the gutter like any other card.
    useEffect(() => {
        const track = trackRef.current;
        if (!track || !canLoop || ready) return;
        const width = copyWidth();
        if (width <= 0) return;
        track.scrollLeft = width;
        setReady(true);
        updateIndicator();
    }, [canLoop, copyWidth, ready, items.length, updateIndicator]);

    // How many segments there are depends on how many cards fit across.
    useEffect(() => {
        if (items.length === 0) return;
        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [items.length, updateIndicator]);

    const onScroll = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        if (canLoop && !repositioning.current && !animating.current) {
            const width = copyWidth();
            if (width > 0) {
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
            }
        }

        updateIndicator();
    }, [canLoop, copyWidth, updateIndicator]);

    /** Move by the posters that fit fully on screen, landing on a poster's edge. */
    const scrollByPage = (direction: -1 | 1) => {
        const track = trackRef.current;
        const card = cardWidth();
        if (!track || card <= 0) return;
        const style = getComputedStyle(track);
        const inner = track.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const perPage = Math.max(1, Math.floor(inner / card));
        // Rounded to a whole card, so a row left mid-poster by a trackpad
        // lines up again.
        const from = animating.current ? heading.current : track.scrollLeft;
        let target = Math.round((from + direction * perPage * card) / card) * card;

        // If the move would leave the middle copy, make the loop's jump now,
        // before the animation (the content is identical, so it's invisible),
        // rather than in the middle of it, which stopped the row partway.
        const copy = copyWidth();
        if (canLoop && copy > 0 && (target > copy * 1.5 || target < copy * 0.5)) {
            const shift = target > copy * 1.5 ? -copy : copy;
            repositioning.current = true;
            track.scrollLeft += shift;
            repositioning.current = false;
            target += shift;
        }
        heading.current = target;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        animating.current = true;
        const id = ++pressId.current;
        const finish = () => {
            if (id !== pressId.current || !animating.current) return;
            animating.current = false;
            onScroll();
        };
        // Only once the row has arrived: the jump above fires a scrollend of
        // its own, and ending there let the loop undo the move.
        const onEnd = () => {
            if (id !== pressId.current) return; // a later press took over
            if (Math.abs(track.scrollLeft - target) <= 1) finish();
            else track.addEventListener('scrollend', onEnd, { once: true });
        };
        track.addEventListener('scrollend', onEnd, { once: true });
        // scrollend isn't everywhere yet (older Safari): don't wait forever.
        setTimeout(finish, 1000);
        track.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
    };

    if (isLoading) return <RowSkeleton title={title} />;

    // A row that cannot load should leave a gap, not break the page.
    if (error || items.length === 0) return null;

    return (
        <section className="group relative flex flex-col gap-3 py-4" aria-label={title}>
            <div className={`flex items-center justify-between gap-4 ${GUTTER}`}>
                <div className="flex min-w-0 items-baseline gap-3">
                    <h2 className="truncate text-xl font-semibold tracking-tight text-white">{title}</h2>
                    {seeAllHref && (
                        <Link
                            href={seeAllHref}
                            className="flex shrink-0 items-center text-sm text-white/60 transition-colors hover:text-white"
                        >
                            See all<span className="sr-only"> {title}</span>
                            <ChevronRightRoundedIcon sx={{ fontSize: 18 }} aria-hidden />
                        </Link>
                    )}
                </div>

                {/* Decorative: the arrows already describe the same movement.
                    Only with a mouse and a sensible number of segments: on a
                    phone a 20-poster row made up to 20 of them, about 400px,
                    which widened the whole home page (item 39). */}
                {pageCount > 1 && pageCount <= MAX_SEGMENTS && (
                    <div
                        className="hidden shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 pointer-fine:flex"
                        aria-hidden="true"
                    >
                        {Array.from({ length: pageCount }, (_, i) => (
                            <span
                                key={i}
                                className={`h-[3px] w-4 rounded-full transition-colors ${
                                    i === activePage ? 'bg-white' : 'bg-white/25'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => scrollByPage(-1)}
                    aria-label={`Scroll ${title} backwards`}
                    className={`${ARROW} left-2 sm:left-3`}
                >
                    <ChevronLeftRoundedIcon />
                </button>

                <div
                    ref={trackRef}
                    onScroll={onScroll}
                    // No scroll-smooth here: it would animate the programmatic
                    // wrap, making the jump visible and racing the initial
                    // positioning. Smoothness belongs on scrollTo only. Swipes
                    // snap to a poster on touch screens; with a mouse or
                    // trackpad the row scrolls freely.
                    className={`flex gap-2 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-px-4 sm:scroll-px-6 pointer-coarse:snap-x pointer-coarse:snap-mandatory ${GUTTER}`}
                >
                    {rendered.map((movie, index) => (
                        <div
                            key={`${movie.id}-${index}`}
                            className="group/card relative shrink-0 snap-start"
                            // Only the middle copy is announced; the other two are
                            // duplicates that exist to make the loop seamless.
                            aria-hidden={canLoop && (index < items.length || index >= items.length * 2)}
                        >
                            <PosterItem
                                item={movie}
                                size={size}
                                onSelect={(m, element) => setSelected({ movie: m, element })}
                                // The heart shows on hover or focus, and stays
                                // once the movie is a favourite.
                                topRight={
                                    <span className="block opacity-0 transition-opacity group-hover/card:opacity-100 focus-within:opacity-100 has-[[aria-pressed=true]]:opacity-100">
                                        <Favorite id={movie.id} title={movie.title} appearance="plain" />
                                    </span>
                                }
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => scrollByPage(1)}
                    aria-label={`Scroll ${title} forwards`}
                    className={`${ARROW} right-2 sm:right-3`}
                >
                    <ChevronRightRoundedIcon />
                </button>
            </div>

            {selected && (
                <MoviePreview
                    key={selected.movie.id}
                    movie={selected.movie}
                    originElement={selected.element}
                    onClose={() => setSelected(null)}
                />
            )}
        </section>
    );
}
