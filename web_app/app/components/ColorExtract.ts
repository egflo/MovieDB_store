import { useState, useEffect } from 'react';
import { Palette } from 'auto-palette';

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

/** Draw the image into a small canvas and return it for extraction. */
function downscale(img: HTMLImageElement): HTMLCanvasElement | null {
    const { naturalWidth: w, naturalHeight: h } = img;
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

export const usePalette = (imageUrl: string) => {
    const [palette, setPalette] = useState<Palette | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!imageUrl) {
            setPalette(null);
            return;
        }

        let cancelled = false;
        let objectUrl: string | null = null;
        const img = new window.Image();

        const run = async () => {
            try {
                const response = await fetch(`${proxy}${encodeURIComponent(imageUrl)}`);
                if (!response.ok) throw new Error(`proxy returned ${response.status}`);

                const blob = await response.blob();
                if (cancelled) return;

                objectUrl = URL.createObjectURL(blob);

                img.onload = () => {
                    if (cancelled) return;
                    try {
                        const source = downscale(img);
                        if (!source) throw new Error('image had no dimensions');
                        setPalette(Palette.extract(source));
                    } catch (e) {
                        setError('Failed to extract palette');
                        console.error(e);
                    }
                };
                img.onerror = () => {
                    // The proxy answers 200 with a 162-byte body for http:// image
                    // urls, because it will not follow the redirect to https.
                    if (!cancelled) setError('Image did not decode');
                };
                img.src = objectUrl;
            } catch (err) {
                if (!cancelled) {
                    setError('Failed to extract palette');
                    console.error(err);
                }
            }
        };

        run();

        return () => {
            // Without this a slide change leaves the previous extraction to land
            // on an unmounted component, and every blob url leaks.
            cancelled = true;
            img.onload = null;
            img.onerror = null;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imageUrl]);

    return { palette, error };
};
