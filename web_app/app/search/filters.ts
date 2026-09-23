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

/**
 * Prices in the URL are whole or decimal dollars (`pmin=15&pmax=19.99`); the
 * API takes cents. Either end may be open. Every price in the data is between
 * $10 and $25, in whole dollars.
 */
export const PRICE_MAX = 1000;

/** A price from the URL or an input, or null if missing or out of range. */
export function parsePrice(value: string | null | undefined): number | null {
    if (value == null || value.trim() === '') return null;
    const price = Number(value);
    return Number.isFinite(price) && price >= 0 && price <= PRICE_MAX ? Math.round(price * 100) / 100 : null;
}

const dollars = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

/** "$15–$19", "$20 and up", "Up to $14", or null. */
export function priceLabel(min: number | null, max: number | null): string | null {
    if (min !== null && max !== null) return min === max ? dollars(min) : `${dollars(min)}–${dollars(max)}`;
    if (min !== null) return `${dollars(min)} and up`;
    if (max !== null) return `Up to ${dollars(max)}`;
    return null;
}

/** The page heading and tab title for a price filter alone. */
export function priceHeading(min: number | null, max: number | null): string | null {
    const label = priceLabel(min, max);
    return label && `Movies ${label.replace(/^Up to/, 'up to')}`;
}
