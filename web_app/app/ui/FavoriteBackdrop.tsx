'use client';

import { useBookmarks } from "@/lib/context/BookmarkContext";
import type { Bookmark } from "@/lib/models/Bookmark";
import { optimizerUrl } from "@/lib/image";
import ScrollZoomBackdrop from "@/app/components/ScrollZoomBackdrop";

/**
 * Only real links count. Missing posters are stored as "N/A" (2,320 movies)
 * or "", and every real poster and background starts with http(s)://.
 */
const isImageUrl = (value: unknown): value is string => typeof value === "string" && /^https?:\/\//.test(value);

/**
 * The newest favourite with a real image: its background, else its poster
 * (only ~400 movies have a background at all). Favourites with neither are
 * skipped in favour of older ones.
 */
export function pickBackdrop(bookmarks: Bookmark[]): string | undefined {
    const latest = [...bookmarks]
        .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
        .find((b) => isImageUrl(b.movie?.background) || isImageUrl(b.movie?.poster));
    if (!latest) return undefined;
    return isImageUrl(latest.movie.background) ? latest.movie.background : latest.movie.poster;
}

/**
 * The most recently saved favourite's backdrop behind the whole page, as a
 * heavily blurred colour wash (like the cast page), so glass surfaces have
 * something to frost; over the flat page background the blur had nothing to
 * show. Used by the account and Favorites pages. Renders nothing until
 * favourites load, or if there are none. The page needs `isolate`.
 */
export default function FavoriteBackdrop() {
    const { bookmarks } = useBookmarks();
    const image = pickBackdrop(bookmarks);
    if (!image) return null;
    // Blurred this much, a 256px thumbnail looks the same as the original.
    return <ScrollZoomBackdrop src={optimizerUrl(image, 256) ?? image} />;
}
