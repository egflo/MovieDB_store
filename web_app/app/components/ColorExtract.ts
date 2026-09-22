import { useState, useEffect } from 'react';
import { Palette } from 'auto-palette';
import { optimizerUrl } from '@/lib/image';

const proxy = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/proxy-image?url=`;

/**
 * Longest edge, in pixels, that the palette is extracted from.
 *
 * Palette.extract runs DBSCAN clustering synchronously on the main thread. Run
 * against a full 1920x1080 background that is 2.07 million points, which
 * freezes the tab. Downscaling to 240px first leaves ~32k points — roughly a
 * 65x reduction — and the browser does the resampling on the GPU.
 *
 * Downscaling rather than auto-palette's samplingRate: sampling sparsely enough
 * to matter sometimes left DBSCAN with no cluster at all, so the cost was paid
 * and no colour came back. Averaging pixels down keeps the dominant colour.
 */
const MAX_EDGE = 240;

export type RGB = { r: number; g: number; b: number };

/** Draw the image into a small canvas and return it for extraction. */
function downscale(img: ImageBitmap): HTMLCanvasElement | null {
    const { width: w, height: h } = img;
    if (!w || !h) return null;

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
}

/**
 * Fetch, decode and downscale. Decoding the fetched blob directly keeps the
 * canvas untainted (a cross-origin <img> would taint it). createImageBitmap
 * rather than <img>.decode(): decode() never settled in a hidden document,
 * so a page loaded in a background tab got no colour.
 */
async function loadDownscaled(src: string): Promise<HTMLCanvasElement | null> {
    const response = await fetch(src);
    if (!response.ok) throw new Error(`${response.status} for ${src}`);
    const bitmap = await createImageBitmap(await response.blob());
    try {
        return downscale(bitmap);
    } finally {
        bitmap.close();
    }
}

async function extract(imageUrl: string): Promise<RGB | null> {
    // A 256px copy from the Next image optimizer: ~10 KB and cached, against
    // 0.8–1.5 MB for the original through the proxy. Only 240px is used anyway.
    // The proxy stays as the fallback for hosts the optimizer doesn't cover and
    // for a cold original that outlasts the optimizer's 7s upstream limit.
    const viaProxy = `${proxy}${encodeURIComponent(imageUrl)}`;
    const thumbnail = optimizerUrl(imageUrl, 256);
    let source: HTMLCanvasElement | null;
    try {
        source = await loadDownscaled(thumbnail ?? viaProxy);
    } catch (e) {
        if (!thumbnail) throw e;
        source = await loadDownscaled(viaProxy);
    }
    if (!source) return null;

    // auto-palette exposes swatches via findSwatches(), not a `colors` array.
    const [swatch] = Palette.extract(source).findSwatches(1);
    return swatch ? swatch.color.toRGB() : null;
}

// One extraction per image for the life of the page. `pending` dedupes calls
// made while one is in flight; `resolved` lets a revisit render the colour on
// its first frame instead of flashing the fallback while a promise settles.
const pending = new Map<string, Promise<RGB | null>>();
const resolved = new Map<string, RGB | null>();

export function dominantColor(imageUrl: string): Promise<RGB | null> {
    let promise = pending.get(imageUrl);
    if (!promise) {
        promise = extract(imageUrl)
            .catch((e) => {
                console.error('Palette extraction failed', imageUrl, e);
                return null;
            })
            .then((color) => {
                resolved.set(imageUrl, color);
                return color;
            });
        pending.set(imageUrl, promise);
    }
    return promise;
}

/**
 * The image's dominant colour, or null until it's known (or if extraction
 * fails). Pass enabled=false to hold off starting the work; a colour that's
 * already known is returned either way, so a slide keeps its colour once it has
 * one.
 */
export function useDominantColor(imageUrl: string, enabled = true): RGB | null {
    const [color, setColor] = useState<RGB | null>(() => resolved.get(imageUrl) ?? null);

    useEffect(() => {
        if (!imageUrl) return;
        if (resolved.has(imageUrl)) {
            setColor(resolved.get(imageUrl) ?? null);
            return;
        }
        if (!enabled) return;

        let cancelled = false;
        dominantColor(imageUrl).then((c) => {
            if (!cancelled) setColor(c);
        });
        return () => {
            cancelled = true;
        };
    }, [imageUrl, enabled]);

    return color;
}
