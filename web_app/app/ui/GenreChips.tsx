import React from "react";
import Link from "next/link";

/**
 * A movie's genres as small outlined pills, each a link to the search page
 * filtered by that genre. Used in the movie preview and on the movie page.
 * Links rather than click handlers, so they open in a new tab too and read
 * as links to screen readers.
 */
export default function GenreChips({genres}: { genres: string[] | null | undefined }) {
    if (!genres?.length) return null;
    return (
        <ul aria-label="Genres" className="flex flex-wrap gap-2">
            {genres.map((genre) => (
                <li key={genre}>
                    <Link
                        href={`/search?genres=${encodeURIComponent(genre)}`}
                        aria-label={`More ${genre} movies`}
                        className="block rounded-full px-3 py-1 text-xs font-medium text-gray-200 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/10 hover:text-white hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        {genre}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
