'use client';

import {Movie} from "@/lib/models/Movie";
import PosterItem from "@/app/ui/PosterItem";
import Favorite from "@/app/components/actions/Favorite";
import {pickScore} from "@/lib/score";

/**
 * A movie as a poster card: title, a short meta line and one review score on
 * frosted glass, and a favourite heart in the corner. Used by search results,
 * Favorites, the movie page's Related row and the cast page's filmography.
 *
 * "fluid" fills a grid column (MOVIE_GRID); "small" is a fixed 200x300 for
 * horizontally scrolling rows, where there's no column width to fill. The card
 * renders no list item of its own, so grids wrap it in <li> and rows don't.
 */
export function MovieCard({movie, size = "fluid", meta}: {
    movie: Movie;
    size?: "fluid" | "small";
    /** Replaces the default "year · first genre", e.g. "Writer · 2019". */
    meta?: string;
}) {
    // One genre, so year, genre and the score fit on one line at card width.
    const line = meta ?? [movie.year, movie.genres?.[0]].filter(Boolean).join(' · ');
    return (
        <PosterItem
            item={movie}
            size={size}
            caption={{title: movie.title, meta: line, score: pickScore(movie.ratings)}}
            topRight={<Favorite id={movie.id} title={movie.title} appearance="plain" />}
        />
    );
}

// Flexible columns, at least 160px, that stretch to fill the row exactly. Fixed
// 200px columns left a gap on the right whenever one more didn't quite fit.
export const MOVIE_GRID = "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4";

export function MovieGridSkeleton({count, label = "Loading"}: { count: number; label?: string }) {
    return (
        <ul role="status" aria-label={label} className={`${MOVIE_GRID} motion-safe:animate-pulse`}>
            {Array.from({length: Math.min(count, 20)}, (_, i) => (
                <li key={i} className="aspect-[2/3] w-full rounded-lg bg-white/5" />
            ))}
        </ul>
    );
}
