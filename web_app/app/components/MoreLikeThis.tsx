'use client';

import React, { useState } from "react";
import useSWR from "swr";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Movie } from "@/lib/models/Movie";
import { Page } from "@/lib/models/Page";
import { MovieCard } from "@/app/ui/MovieCard";

const SUGGEST_URL = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/suggest/`;
/** Fetch more than we show, so the 12 shown can be the ones with posters. */
const FETCH = 24;
/** At most four rows of three. */
const MAX = 12;
/** Two rows before the expand line. */
const COLLAPSED = 6;

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    return res.json();
};

const hasPoster = (m: Movie) => typeof m.poster === "string" && /^https?:\/\//.test(m.poster);

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4";

/**
 * "More Like This" for the movie preview: up to 12 of the movie's suggestions
 * as poster cards, two rows at first. A line with a round chevron slides the
 * rest open (and shut). Titles with a poster come first; many suggestions
 * have none. Renders nothing if there are no suggestions.
 */
export default function MoreLikeThis({ movie }: { movie: Movie }) {
    const [expanded, setExpanded] = useState(false);
    const { data, error, isLoading } = useSWR<Page<Movie>>(
        movie.movieId ? `${SUGGEST_URL}${movie.movieId}?sortBy=rating&page=0&limit=${FETCH}` : null,
        fetcher,
        { revalidateOnFocus: false },
    );

    const movies = (data?.content ?? [])
        .filter((m) => m.id !== movie.id && m.title)
        // Stable: keeps the rating order within each group.
        .sort((a, b) => Number(hasPoster(b)) - Number(hasPoster(a)))
        .slice(0, MAX);

    if (error || (!isLoading && movies.length === 0)) return null;

    const first = movies.slice(0, COLLAPSED);
    const rest = movies.slice(COLLAPSED);

    return (
        <section aria-labelledby="more-like-this" className="flex flex-col gap-4">
            <h3 id="more-like-this" className="text-xl font-semibold">More Like This</h3>
            {isLoading ? (
                <ul aria-busy="true" aria-label="Loading similar titles" className={GRID}>
                    {Array.from({ length: COLLAPSED }, (_, n) => (
                        <li key={n} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
                    ))}
                </ul>
            ) : (
                <div id="more-like-this-list">
                    <ul className={GRID}>
                        {first.map((m) => <li key={m.id}><MovieCard movie={m} /></li>)}
                    </ul>
                    {rest.length > 0 && (
                        // Slides open by animating the row from 0fr to 1fr (a
                        // height transition to "auto" isn't possible), fading
                        // the cards in as it goes. inert while shut, so the
                        // hidden cards can't be tabbed to or read out.
                        <div
                            inert={!expanded}
                            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out motion-reduce:transition-none ${
                                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                            {/* 8px of room (offset by negative margins) so a
                                card's hover zoom isn't clipped at the edges. */}
                            <div className="-mx-2 -mb-2 min-h-0 overflow-hidden px-2 pb-2">
                                {/* The top gap lives inside, so it opens with the rows. */}
                                <ul className={`${GRID} pt-3 sm:pt-4`}>
                                    {rest.map((m) => <li key={m.id}><MovieCard movie={m} /></li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {rest.length > 0 && (
                // A hairline across the section with the toggle on it.
                <div className="relative flex justify-center py-1">
                    <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
                    <button
                        type="button"
                        onClick={() => setExpanded((e) => !e)}
                        aria-expanded={expanded}
                        aria-controls="more-like-this-list"
                        aria-label={expanded ? "Show fewer titles" : `Show all ${movies.length} similar titles`}
                        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white ring-1 ring-inset ring-white/40 transition-colors hover:bg-neutral-800 hover:ring-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <ExpandMoreRoundedIcon className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                    </button>
                </div>
            )}
        </section>
    );
}
