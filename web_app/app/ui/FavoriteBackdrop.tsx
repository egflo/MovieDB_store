'use client';

import { useBookmarks } from "@/lib/context/BookmarkContext";
import { optimizerUrl } from "@/lib/image";
import ScrollZoomBackdrop from "@/app/components/ScrollZoomBackdrop";

/**
 * The most recently saved favourite's backdrop behind the whole page, as a
 * heavily blurred colour wash (like the cast page), so glass surfaces have
 * something to frost; over the flat page background the blur had nothing to
 * show. Used by the account and Favorites pages. Renders nothing until
 * favourites load, or if there are none. The page needs `isolate`.
 */
export default function FavoriteBackdrop() {
    const { bookmarks } = useBookmarks();
    const latest = [...bookmarks]
        .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
        .find((b) => b.movie?.background || b.movie?.poster);
    const image: string | undefined = latest && (latest.movie.background || latest.movie.poster);
    if (!image) return null;
    // Blurred this much, a 256px thumbnail looks the same as the original.
    return <ScrollZoomBackdrop src={optimizerUrl(image, 256) ?? image} />;
}
