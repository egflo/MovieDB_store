import { getImageProps } from 'next/image';

/**
 * Hosts the movie data's images come from. Must match images.remotePatterns in
 * next.config.ts: next/image throws for a host that isn't configured there.
 */
const OPTIMIZED_HOSTS = new Set([
    'assets.fanart.tv',
    'm.media-amazon.com',
    'images-na.ssl-images-amazon.com',
    'ia.media-imdb.com',
]);

/**
 * fanart.tv originals are 0.8–1.5 MB (1000x1426 posters, 1920x1080
 * backgrounds), and some take over 10s to download. Passing them through the
 * Next image optimizer resizes each one to the size it's drawn at and caches
 * the result, so a poster card gets a ~20 KB WebP instead.
 *
 * Returns src/srcSet for a plain <img>, so callers keep their own markup and
 * error handling. Anything that isn't an http(s) URL on a known host (the data
 * holds "N/A" for missing posters) is passed through unchanged.
 */
export function optimizedImage(url: string, width: number, height: number, sizes?: string) {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return { src: url };
    }
    if (!OPTIMIZED_HOSTS.has(parsed.hostname) || !/^https?:$/.test(parsed.protocol)) {
        return { src: url };
    }

    // Most fanart.tv URLs in the data are http://, which 301s to https://.
    // Asking for https:// directly saves the optimizer a round trip.
    if (parsed.hostname === 'assets.fanart.tv') parsed.protocol = 'https:';

    const { props } = getImageProps({ src: parsed.toString(), alt: '', width, height, sizes });
    return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
}

/**
 * What to show when optimizedImage's URL fails. The optimizer gives up on an
 * upstream after a hard-coded 7s (not configurable in Next 15), and large
 * fanart.tv originals can take longer, so a cold image can 500 on first view.
 * fanart.tv serves a 200px-wide /preview/ of every image that loads in about a
 * second; anything else falls back to the original URL.
 */
export function fallbackImage(url: string): string {
    return url.replace(/^https?:\/\/assets\.fanart\.tv\/fanart\//, 'https://assets.fanart.tv/preview/');
}
