'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {optimizedImage, optimizerUrl} from '@/lib/image';
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import { Movie } from '@/lib/models/Movie';
import Box from "@mui/material/Box";
import MoreLikeThis from './MoreLikeThis';
import AboutMovie from './AboutMovie';
import Favorite from '@/app/components/actions/Favorite';
import Rate from '@/app/components/actions/Rate';
import SubSection from '@/app/ui/SubSection';
import RatingsSection from '@/app/ui/RatingsSection';
import GenreChips from '@/app/ui/GenreChips';
import { PRIMARY_PILL } from '@/app/ui/chip';

const DURATION_MS = 300;

interface MoviePreviewProps {
    movie: Movie;
    /**
     * The poster that opened this. Measured lazily on collapse rather than
     * captured on open, because the row can scroll while the preview is up and
     * the panel should return to where the card is *now*.
     */
    originElement: HTMLElement;
    onClose: () => void;
}

/**
 * A Netflix-style detail panel that grows out of the poster that opened it.
 *
 * Uses FLIP: the panel is laid out at its final size, then immediately
 * transformed back onto the poster's rect and released. The browser animates a
 * transform rather than width and height, so it stays on the compositor.
 */
export default function MoviePreview({ movie, originElement, onClose }: MoviePreviewProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const closing = useRef(false);

    const reducedMotion = () =>
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /** Transform that maps the panel's own box onto the originating poster. */
    const transformToOrigin = useCallback(() => {
        const panel = panelRef.current;
        const origin = originElement?.getBoundingClientRect();
        if (!panel || !origin) return null;

        // Measure the panel untransformed. If a previous run already mapped it
        // onto the poster — which React's development double-invoke of effects
        // does — measuring as-is returns the poster's own box, and the maths
        // below collapses to an identity transform with no animation.
        const previous = panel.style.transform;
        panel.style.transform = 'none';
        const final = panel.getBoundingClientRect();
        panel.style.transform = previous;

        if (final.width === 0 || final.height === 0) return null;

        // One scale for both axes, from the top edge (transform-origin top
        // centre): with More Like This the panel is far taller than a poster,
        // and fitting its height too squashed it into a sliver. It grows from
        // the poster's width and top edge instead.
        const dx = origin.left + origin.width / 2 - (final.left + final.width / 2);
        const dy = origin.top - final.top;
        const scale = origin.width / final.width;
        return `translate(${dx}px, ${dy}px) scale(${scale})`;
    }, [originElement]);

    const collapse = useCallback(() => {
        const panel = panelRef.current;
        if (!panel || closing.current) return;
        closing.current = true;

        if (reducedMotion()) {
            onClose();
            return;
        }

        const target = transformToOrigin();
        if (!target) {
            onClose();
            return;
        }

        if (backdropRef.current) backdropRef.current.style.opacity = '0';
        panel.style.transition = `transform ${DURATION_MS}ms ease, opacity ${DURATION_MS}ms ease`;
        panel.style.transform = target;
        panel.style.opacity = '0';

        const done = () => onClose();
        panel.addEventListener('transitionend', done, { once: true });
        // transitionend does not fire if the panel is removed or the transition
        // is interrupted, so do not rely on it alone.
        window.setTimeout(done, DURATION_MS + 60);
    }, [onClose, transformToOrigin]);

    // Grow out of the poster on mount.
    //
    // useLayoutEffect, not useEffect: useEffect runs *after* paint, so the
    // panel would be painted once at full size before the collapsed transform
    // was applied — the open would flash straight to full size with no
    // animation, while the close (which changes a transform on an already
    // settled element) animated correctly.
    useLayoutEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;

        panel.focus({ preventScroll: true });

        if (reducedMotion()) return;

        const from = transformToOrigin();
        if (!from) return;

        panel.style.transition = 'none';
        panel.style.transform = from;
        panel.style.opacity = '0.4';

        // Force a style recalculation so the collapsed state becomes the
        // transition's starting value.
        //
        // Reading offsetHeight is the usual trick, but it only forces *layout*,
        // and transform is a compositor property that does not dirty layout —
        // so the transition was starting from identity and the panel appeared
        // at full size immediately. Reading the computed transform forces the
        // style recalc that actually commits it.
        //
        // Deliberately not requestAnimationFrame either: it is throttled in
        // hidden or backgrounded surfaces, and when it never fires the panel
        // stays stuck at poster size.
        void getComputedStyle(panel).transform;

        panel.style.transition = `transform ${DURATION_MS}ms ease, opacity ${DURATION_MS}ms ease`;
        panel.style.transform = '';
        panel.style.opacity = '1';
        // Intentionally runs once: re-running would restart the animation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Hand focus back to the poster, so keyboard users resume where they were.
    useEffect(() => {
        return () => originElement?.focus?.({ preventScroll: true });
    }, [originElement]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                collapse();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [collapse]);

    const backdrop = movie.background || movie.poster;
    // The optimizer 500s on an upstream slower than 7s; show the original then.
    const [useOriginal, setUseOriginal] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    // Placeholder while the backdrop loads: the poster from the card that was
    // clicked. The browser already has it, so it shows immediately.
    const [placeholder] = useState(
        () => originElement?.querySelector('img')?.currentSrc || null,
    );

    // A backdrop already in the browser cache can finish before React attaches
    // onLoad, which would leave the placeholder up for good.
    useLayoutEffect(() => {
        const img = imageRef.current;
        if (img?.complete && img.naturalWidth > 0) setLoaded(true);
    }, [useOriginal]);

    return (
        // Scrolls, since More Like This and About make the panel taller than
        // the screen; overscroll-contain keeps the page behind still.
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
            <div
                ref={backdropRef}
                onClick={collapse}
                className="fixed inset-0 bg-black/70 transition-opacity duration-300"
            />

            {/* Clicks in the margins fall through to the backdrop and close. */}
            <div className="pointer-events-none relative flex min-h-full items-start justify-center px-4 py-10">
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={movie.title}
                    tabIndex={-1}
                    // The panel scales as a whole from its top edge, to match
                    // the translate maths in transformToOrigin.
                    style={{ transformOrigin: 'top center' }}
                    className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-xl bg-neutral-900 text-white shadow-2xl outline-none"
                >
                    <button
                        type="button"
                        onClick={collapse}
                        aria-label="Close preview"
                        className="absolute right-2 top-2 z-10 cursor-pointer rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur-md hover:bg-black/55"
                    >
                        <CloseIcon fontSize="small" />
                    </button>

                    {/* The backdrop carried on below the hero: a small, heavily
                        blurred, dimmed copy that fades out over ~700px, so the
                        film's colour seeps through More Like This. The hero's
                        image, placeholder and glass fade out over their last
                        8rem onto this layer, so there's no edge where the hero
                        ends. 256px is plenty at this blur. Fades in with the
                        hero image; skipped if it failed. */}
                    {backdrop && !failed && (
                        <div
                            aria-hidden="true"
                            className={`pointer-events-none absolute inset-x-0 top-0 h-[1200px] overflow-hidden transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,black_40%,transparent)] ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={optimizerUrl(backdrop, 256) ?? backdrop}
                                alt=""
                                className="h-full w-full scale-125 object-cover opacity-60 blur-3xl saturate-150"
                            />
                        </div>
                    )}

                    {/* The hero: backdrop, placeholder and info. Its own
                        positioned box, so the absolutely placed images cover
                        this part only, not More Like This below. */}
                    <div className="relative">
                    {/* Stays mounted under the backdrop so the backdrop fades
                        in over it rather than over the bare panel. Pulses only
                        while loading; if the backdrop fails it stays as the
                        panel's background. */}
                    <div
                        aria-hidden="true"
                        className={`absolute inset-0 overflow-hidden bg-neutral-800 [mask-image:linear-gradient(to_bottom,black_calc(100%-10rem),transparent_calc(100%-3rem))] ${loaded || failed ? '' : 'motion-safe:animate-pulse'}`}
                    >
                        {placeholder && (
                            // Blurred and scaled up so the blur has no soft
                            // edges; dimmed so it reads as loading.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={placeholder}
                                alt=""
                                className="h-full w-full scale-125 object-cover opacity-60 blur-2xl"
                            />
                        )}
                    </div>

                    {backdrop && !failed && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            ref={imageRef}
                            {...(useOriginal
                                ? {src: backdrop}
                                : optimizedImage(backdrop, 1200, 675, "(max-width: 768px) 100vw, 768px"))}
                            onLoad={() => setLoaded(true)}
                            onError={() => (useOriginal ? setFailed(true) : setUseOriginal(true))}
                            alt=""
                            aria-hidden="true"
                            // Fills the whole panel so the info area below has
                            // something to blur; the spacer keeps the visible
                            // band at its old height. Fades in over the
                            // placeholder once loaded.
                            className={`absolute inset-0 h-full w-full object-cover [mask-image:linear-gradient(to_bottom,black_calc(100%-10rem),transparent_calc(100%-3rem))] transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                    <div className="h-56" aria-hidden="true" />

                    <div className="relative p-5">
                        {/* Frosted glass behind the text: a progressive blur.
                            One layer faded in over 4rem left a visible seam on
                            detailed backdrops (Shawshank: a face sharp above a
                            line, blurred below). Three layers, each fading in a
                            little lower, stack light, medium, then full blur
                            with the dark tint: from 3rem above the text to 5rem
                            into it, leaving the top of the image sharp. At the
                            bottom the order matters: the photo is fully faded
                            3rem before the hero ends, and only then does the
                            blur fade, over those last 3rem. Blur fading with
                            the photo brought it back into focus; blur stopping
                            dead left a lighter band with a hard edge. */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 -top-12 bottom-0 backdrop-blur-[3px] [mask-image:linear-gradient(to_bottom,transparent,black_3rem,black_calc(100%-3rem),transparent)]"
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 -top-12 bottom-0 backdrop-blur-md [mask-image:linear-gradient(to_bottom,transparent_1.5rem,black_5rem,black_calc(100%-3rem),transparent)]"
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 -top-12 bottom-0 backdrop-blur-2xl backdrop-saturate-150 [mask-image:linear-gradient(to_bottom,transparent_3rem,black_8rem,black_calc(100%-3rem),transparent)]"
                        />
                        {/* The tint, separate so it can fade out gently over the
                            last 8rem rather than the blur's last 3rem. */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 -top-12 bottom-0 bg-neutral-950/45 [mask-image:linear-gradient(to_bottom,transparent_3rem,black_8rem,black_calc(100%-8rem),transparent)]"
                        />
                        <div className="relative flex flex-col gap-3">


                            {movie.logo &&
                                <Box className={"flex justify-left items-left p-0 m-0  rounded-lg "}>
                                    {/* Through the optimizer: fanart.tv logos are full-size
                                    PNGs, often http:// URLs that redirect. Left-aligned
                                    in its box from md up, so a narrow logo starts at
                                    the column's edge like the rows below it. */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img {...optimizedImage(movie.logo, 200, 75)} alt={movie.title} className={"w-[200px] h-[75px] object-contain md:object-left"} />
                                </Box>
                            }
                            {!movie.logo &&
                                <h2 className="text-2xl font-bold">{movie.title}</h2>
                            }

                            {/* Year • content rating (PG-13...) • runtime, as on the
                                movie page. The year used to show only beside a
                                text title. */}
                            <SubSection movie={movie} />

                            {/* Each genre links to the search page filtered by it. */}
                            <GenreChips genres={movie.genres} />

                            {/* Every review score, on its own row, as on the movie page. */}
                            <RatingsSection movie={movie} />

                            {movie.plot && (
                                <p className="line-clamp-4 text-sm text-gray-200">{movie.plot}</p>
                            )}

                            <div className={"hidden md:flex flex-row gap-4"}>
                                <div className={" flex flex-col"}>
                                    <p className="text-sm text-white font-semibold shadow-2xl">
                                        {movie.director}
                                    </p>
                                    <span className="text-sm text-gray-400"> Director</span>
                                </div>

                                <div className={" flex flex-col"}>
                                    <p className="text-sm text-white font-semibold shadow-2xl">
                                        {movie.production}
                                    </p>
                                    <span className="text-sm text-gray-400"> Production</span>
                                </div>
                            </div>






                            {/* The home hero's pair plus the movie page's rating
                                button. Closing is the ✕ at the top, Esc, or a
                                click outside. */}
                            <div className="flex flex-row items-center gap-2 pt-1">
                                <Link href={`/movie/${movie.id}`} className={PRIMARY_PILL}>
                                    More info<span className="sr-only"> about {movie.title}</span>
                                </Link>
                                <Favorite id={movie.id} title={movie.title} />
                                <Rate id={movie.id} />
                            </div>
                        </div>
                    </div>
                    </div>

                    {/* relative: above the blurred backdrop layer. */}
                    <div className="relative flex flex-col gap-8 px-5 pb-8 pt-4">
                        <MoreLikeThis movie={movie} />
                        <AboutMovie movie={movie} />
                    </div>
                </div>
            </div>
        </div>
    );
}
