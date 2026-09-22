'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {optimizedImage} from '@/lib/image';
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import { Movie } from '@/lib/models/Movie';

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

        const dx = origin.left + origin.width / 2 - (final.left + final.width / 2);
        const dy = origin.top + origin.height / 2 - (final.top + final.height / 2);
        const sx = origin.width / final.width;
        const sy = origin.height / final.height;
        return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
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
        <div className="fixed inset-0 z-50">
            <div
                ref={backdropRef}
                onClick={collapse}
                className="absolute inset-0 bg-black/70 transition-opacity duration-300"
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={movie.title}
                    tabIndex={-1}
                    // The panel scales as a whole, so keep the transform origin
                    // at its centre to match the translate maths above.
                    style={{ transformOrigin: 'center center' }}
                    className="pointer-events-auto relative w-full max-w-xl overflow-hidden rounded-xl bg-neutral-900 text-white shadow-2xl outline-none"
                >
                    <button
                        type="button"
                        onClick={collapse}
                        aria-label="Close preview"
                        className="absolute right-2 top-2 z-10 cursor-pointer rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur-md hover:bg-black/55"
                    >
                        <CloseIcon fontSize="small" />
                    </button>

                    {/* Stays mounted under the backdrop so the backdrop fades
                        in over it rather than over the bare panel. Pulses only
                        while loading; if the backdrop fails it stays as the
                        panel's background. */}
                    <div
                        aria-hidden="true"
                        className={`absolute inset-0 overflow-hidden bg-neutral-800 ${loaded || failed ? '' : 'motion-safe:animate-pulse'}`}
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
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                    <div className="h-56" aria-hidden="true" />

                    <div className="relative p-5">
                        {/* Frosted glass: a dark translucent tint for text
                            contrast, blurred and slightly saturated so the
                            backdrop's colour shows through. It starts 4rem up
                            into the image and a mask fades it in over that
                            distance, so there's no visible edge where the
                            image ends and the glass begins. */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 bg-neutral-950/45 backdrop-blur-2xl backdrop-saturate-150 [mask-image:linear-gradient(to_bottom,transparent,black_4rem)]"
                        />

                        <div className="relative flex flex-col gap-3">
                            <div className="flex flex-row items-baseline gap-3">
                                <h2 className="text-2xl font-bold">{movie.title}</h2>
                                {movie.year != null && (
                                    <span className="text-sm text-gray-400">{movie.year}</span>
                                )}
                            </div>

                            {movie.plot && (
                                <p className="line-clamp-4 text-sm text-gray-200">{movie.plot}</p>
                            )}

                            <div className="flex flex-row gap-2 pt-1">
                                <Link
                                    href={`/movie/${movie.id}`}
                                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-800"
                                >
                                    More Info
                                </Link>
                                <button
                                    type="button"
                                    onClick={collapse}
                                    className="cursor-pointer rounded border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
