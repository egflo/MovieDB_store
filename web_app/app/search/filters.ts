// Shared by the search page (a client component) and its server-side
// generateMetadata, so it can't live in the 'use client' Search.tsx: the server
// can't call functions exported from a client module.

/**
 * Content ratings offered as filters, keyed as they appear in the URL. The
 * data spells "not rated" three ways, so that key covers all of them. Only
 * about 5% of movies have a content rating at all, so any rating filter
 * narrows results a lot.
 */
export const CONTENT_RATINGS = [
    {key: 'G', label: 'G', values: ['G']},
    {key: 'PG', label: 'PG', values: ['PG']},
    {key: 'PG-13', label: 'PG-13', values: ['PG-13']},
    {key: 'R', label: 'R', values: ['R']},
    {key: 'NC-17', label: 'NC-17', values: ['NC-17']},
    {key: 'NR', label: 'Not rated', values: ['Not Rated', 'NOT RATED', 'Unrated']},
] as const;
export const ratingLabel = (key: string) => CONTENT_RATINGS.find((r) => r.key === key)?.label ?? key;

/** "Rated R", "Rated PG, PG-13", "Not rated", "Rated R or not rated". */
export function ratingsHeading(keys: string[]): string {
    const rated = keys.filter((k) => k !== 'NR').map(ratingLabel);
    const notRated = keys.includes('NR');
    if (!rated.length) return 'Not rated';
    return `Rated ${rated.join(', ')}${notRated ? ' or not rated' : ''}`;
}
