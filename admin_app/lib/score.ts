import {Rating} from "@/lib/models/Rating";

/** One review score to show on a poster, with its source's icon. */
export interface Score {
    source: 'Rotten Tomatoes' | 'IMDb' | 'Metacritic';
    value: string;
    icon: string;
}

/**
 * Rotten Tomatoes icons by status. Statuses arrive capitalised
 * ("Certified-Fresh", "Upright") while the files are lowercase; building the
 * path from the raw status only worked on a case-insensitive filesystem.
 */
const RT_ICONS: Record<string, string> = {
    'certified-fresh': '/rotten_tomatoes/certified-fresh.png',
    'fresh': '/rotten_tomatoes/fresh.png',
    'rotten': '/rotten_tomatoes/rotten.png',
    'upright': '/rotten_tomatoes/upright.png',
    'spilled': '/rotten_tomatoes/spilled.png',
};

/**
 * The icon for a Rotten Tomatoes score. About 40% of critics' scores have no
 * status, so it falls back to Rotten Tomatoes' own rule: 60% and up is fresh
 * (the audience's popcorn: upright).
 */
export function rottenTomatoesIcon(score: number, status: string | null | undefined, audience = false): string {
    const known = RT_ICONS[(status ?? '').toLowerCase()];
    if (known) return known;
    if (audience) return score >= 60 ? RT_ICONS.upright : RT_ICONS.spilled;
    return score >= 60 ? RT_ICONS.fresh : RT_ICONS.rotten;
}

/**
 * The IMDb user rating. `imdb` is filled for about 10% of movies, but
 * `rating` holds it for about 88%, so it's the fallback. null when neither
 * is set (0 means missing in this data).
 */
export function imdbRating(ratings: Rating | null | undefined): number | null {
    if (!ratings) return null;
    const imdb = (ratings.imdb ?? 0) > 0 ? ratings.imdb! : ratings.rating ?? 0;
    return imdb > 0 ? imdb : null;
}

/**
 * The single score to show for a movie: Rotten Tomatoes if it has one,
 * otherwise IMDb, otherwise Metacritic, otherwise null. A 0 means "missing" in
 * this data.
 */
export function pickScore(ratings: Rating | null | undefined): Score | null {
    if (!ratings) return null;

    const rt = ratings.rottenTomatoes ?? 0;
    if (rt > 0) {
        return {source: 'Rotten Tomatoes', value: `${Math.round(rt)}%`, icon: rottenTomatoesIcon(rt, ratings.rottenTomatoesStatus)};
    }

    const imdb = imdbRating(ratings);
    if (imdb) return {source: 'IMDb', value: imdb.toFixed(1), icon: '/imdb.png'};

    const mc = ratings.metacritic ?? 0;
    if (mc > 0) return {source: 'Metacritic', value: String(Math.round(mc)), icon: '/metacritic.png'};

    return null;
}
