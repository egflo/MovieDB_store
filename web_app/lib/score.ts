import {Rating} from "@/lib/models/Rating";

/** One review score to show on a poster, with its source's icon. */
export interface Score {
    source: 'Rotten Tomatoes' | 'IMDb' | 'Metacritic';
    value: string;
    icon: string;
}

/** Rotten Tomatoes' own rule for a score with no status: 60% and up is fresh. */
const RT_ICONS: Record<string, string> = {
    'certified-fresh': '/rotten_tomatoes/certified-fresh.png',
    'fresh': '/rotten_tomatoes/fresh.png',
    'rotten': '/rotten_tomatoes/rotten.png',
};

/**
 * The single score to show for a movie: Rotten Tomatoes if it has one,
 * otherwise IMDb, otherwise Metacritic, otherwise null. A 0 means "missing" in
 * this data.
 *
 * IMDb: `imdb` is filled for about 10% of movies, but `rating` holds the IMDb
 * user rating for about 88%, so it's the fallback.
 *
 * Rotten Tomatoes: about 40% of scores have no fresh/rotten status, so the
 * icon falls back to the 60% rule. Statuses arrive capitalised
 * ("Certified-Fresh") while the files are lowercase; building the path from
 * the raw status only worked on a case-insensitive filesystem.
 */
export function pickScore(ratings: Rating | null | undefined): Score | null {
    if (!ratings) return null;

    const rt = ratings.rottenTomatoes ?? 0;
    if (rt > 0) {
        const status = (ratings.rottenTomatoesStatus ?? '').toLowerCase();
        const icon = RT_ICONS[status] ?? (rt >= 60 ? RT_ICONS.fresh : RT_ICONS.rotten);
        return {source: 'Rotten Tomatoes', value: `${Math.round(rt)}%`, icon};
    }

    const imdb = (ratings.imdb ?? 0) > 0 ? ratings.imdb! : ratings.rating ?? 0;
    if (imdb > 0) return {source: 'IMDb', value: imdb.toFixed(1), icon: '/imdb.png'};

    const mc = ratings.metacritic ?? 0;
    if (mc > 0) return {source: 'Metacritic', value: String(Math.round(mc)), icon: '/metacritic.png'};

    return null;
}
