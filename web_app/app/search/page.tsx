import type { Metadata } from 'next'
import Search from "./Search"
import {parsePrice, priceHeading, ratingsHeading} from "./filters"

/** "Action · MovieDB", "“star” · MovieDB", "Rated R · MovieDB", "Movies $20 and up · MovieDB", or "Search · MovieDB". */
export async function generateMetadata({
                                           searchParams,
                                       }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
    const params = await searchParams;
    const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
    const query = first(params.query)?.trim();
    const genres = first(params.genres)?.split('_').filter(Boolean) ?? [];

    const rated = first(params.rated)?.split('_').filter(Boolean) ?? [];
    const from = Number(first(params.from)) || null;
    const to = Number(first(params.to)) || null;
    const years = from && to ? (from === to ? `${from}` : `${from}–${to}`) : from ? `${from} onwards` : to ? `up to ${to}` : null;

    // Matches the page's own heading.
    if (query) return { title: `“${query}”` };
    if (genres.length) return { title: genres.join(' & ') };
    if (rated.length) return { title: ratingsHeading(rated) };
    if (years) return { title: from ? `Movies from ${years}` : `Movies ${years}` };
    const prices = priceHeading(parsePrice(first(params.pmin)), parsePrice(first(params.pmax)));
    if (prices) return { title: prices };
    return { title: 'Search' };
}

export default async function Page() {
    return (
        <Search />
    )
}
