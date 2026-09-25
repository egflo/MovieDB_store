import React from "react";
import {Movie} from "@/lib/models/Movie";
import {pickScore} from "@/lib/score";
import {formatRuntime} from "@/app/ui/SubSection";

/**
 * Year · score · runtime (· first two genres) on one line, skipping whatever's
 * missing: the home hero's caption and the movie preview. The score is the
 * site's one score (pickScore), with its source's icon.
 */
export default function DetailsLine({movie, genres = false, className = ""}: {
    movie: Pick<Movie, "year" | "ratings" | "runtime" | "genres">;
    /** Add the first two genres (the preview shows them as chips instead). */
    genres?: boolean;
    className?: string;
}) {
    const score = pickScore(movie.ratings);
    const parts: React.ReactNode[] = [];
    if (movie.year) parts.push(movie.year);
    if (score) parts.push(
        <span key="score" className="inline-flex items-center gap-1 font-semibold text-white" title={`${score.source}: ${score.value}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={score.icon} alt={score.source} className="h-3.5 w-auto" />
            {score.value}
        </span>,
    );
    const runtime = formatRuntime(movie.runtime);
    if (runtime) parts.push(runtime);
    if (genres && movie.genres?.length) parts.push(movie.genres.slice(0, 2).join(", "));
    if (parts.length === 0) return null;
    return (
        <p className={`flex flex-wrap items-center gap-x-2 text-sm text-white/80 ${className}`}>
            {parts.map((part, n) => (
                <React.Fragment key={n}>
                    {n > 0 && <span aria-hidden className="text-white/40">·</span>}
                    {part}
                </React.Fragment>
            ))}
        </p>
    );
}
