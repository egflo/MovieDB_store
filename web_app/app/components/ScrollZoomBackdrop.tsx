'use client';

import { useEffect, useRef } from 'react';

interface ScrollZoomBackdropProps {
    src: string;
    srcSet?: string;
    sizes?: string;
    /** Filter and opacity for the image, e.g. "opacity-50 blur-3xl". */
    imageClassName?: string;
    /** Scale at the top of the page. Keep it over 1 when the image is
     *  blurred, so the blur's soft edges stay off-screen. */
    zoomFrom?: number;
    /** Scale at the bottom of the page; scrolling eases between the two. */
    zoomTo?: number;
}

/**
 * An image fixed behind the whole page that zooms in as the page scrolls down
 * and back out as it scrolls up. The scale is written straight to the element,
 * so scrolling doesn't re-render the page. The parent needs `isolate` (or
 * another stacking context) so the -z-10 stays inside it.
 */
export default function ScrollZoomBackdrop({
    src,
    srcSet,
    sizes,
    imageClassName = 'opacity-50 blur-3xl',
    zoomFrom = 1.25,
    zoomTo = 1.5,
}: ScrollZoomBackdropProps) {
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const img = imageRef.current;
        if (!img) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const update = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const progress = reducedMotion.matches || scrollable <= 0
                ? 0
                : Math.min(1, Math.max(0, window.scrollY / scrollable));
            img.style.scale = String(zoomFrom + (zoomTo - zoomFrom) * progress);
        };

        update();
        // Scroll events already arrive once per frame. The page's height also
        // changes without a scroll (content loading, a section expanding),
        // which moves where the current position sits, so watch the body too.
        window.addEventListener('scroll', update, { passive: true });
        reducedMotion.addEventListener('change', update);
        const resize = new ResizeObserver(update);
        resize.observe(document.body);
        return () => {
            window.removeEventListener('scroll', update);
            reducedMotion.removeEventListener('change', update);
            resize.disconnect();
        };
    }, [zoomFrom, zoomTo]);

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imageRef}
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                alt=""
                style={{ scale: zoomFrom }}
                className={`h-full w-full object-cover will-change-[scale] ${imageClassName}`}
            />
            {/* Darkens toward the bottom so content stays legible over it. */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/10 via-[var(--background)]/50 to-[var(--background)]/85" />
        </div>
    );
}
