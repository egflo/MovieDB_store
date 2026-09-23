'use client';
import {useRouter, useSearchParams} from "next/navigation";
import React, {useEffect, useMemo, useState} from "react";
import useSWR from 'swr';
import {Chip} from "@mui/material";
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { FixedSizeList as List } from "react-window";
import {Movie} from "@/lib/models/Movie";
import {Page} from "@/lib/models/Page";
import {CHIP, CHIP_ICON_SIZE, CHIP_SX} from "@/app/ui/chip";
import {GLASS_CARD} from "@/app/ui/glass";
import {MOVIE_GRID, MovieCard, MovieGridSkeleton} from "@/app/ui/MovieCard";
import Pager from "@/app/ui/Pager";
import {CONTENT_RATINGS, parsePrice, PRICE_MAX, priceHeading, priceLabel, ratingLabel, ratingsHeading} from "./filters";

// res.json() alone treats an error body as data.
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    return res.json();
};

const API = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}`;
const SEARCH_URL = `${API}/movie/search`;
const TAGS_URL = `${API}/movie/tag/all`;

/**
 * The sort menu's options and the API parameters each one sends. The page used
 * to send `sort=relevance|rating|year`, but the API reads `sortBy` (and
 * `direction`, 1 for ascending), so every search came back newest first
 * whatever was chosen. "Top rated" only counts films with enough votes (the
 * API applies a minimum when sorting by rating), so obscure titles with a
 * handful of votes don't lead.
 */
export const SORTS = {
    popular: {label: 'Popular', params: 'sortBy=popularity'},
    rating: {label: 'Top rated', params: 'sortBy=ratings.imdb'},
    newest: {label: 'Newest', params: 'sortBy=year'},
    oldest: {label: 'Oldest', params: 'sortBy=year&direction=1'},
    cheapest: {label: 'Price: low to high', params: 'sortBy=price&direction=1'},
    priciest: {label: 'Price: high to low', params: 'sortBy=price'},
} as const;
export type SortKey = keyof typeof SORTS;
export const DEFAULT_SORT: SortKey = 'popular';

const PAGE_SIZES = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 20;

const GENRES = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Fantasy', 'Thriller', 'Adventure',
    'Animation', 'Documentary', 'Mystery', 'Biography', 'History', 'Western', 'War', 'Musical',
    'Sport', 'Family', 'Short', 'News',
];

interface TagOption { id: number; name: string }

/** Quick year ranges; either end may be open. */
const DECADES: {label: string; from?: number; to?: number}[] = [
    {label: '2020s', from: 2020, to: 2029},
    {label: '2010s', from: 2010, to: 2019},
    {label: '2000s', from: 2000, to: 2009},
    {label: '1990s', from: 1990, to: 1999},
    {label: '1980s', from: 1980, to: 1989},
    {label: 'Before 1980', to: 1979},
];
const YEAR_MIN = 1880; // the oldest film in the data is from 1894
const YEAR_MAX = 2030;

/** Quick price bands, in dollars; every price in the data is a whole dollar. */
const PRICE_BANDS: {min?: number; max?: number}[] = [
    {max: 14},
    {min: 15, max: 19},
    {min: 20},
];

/** "2008", "2000–2009", "2000 onwards", "Up to 1979", or null. */
function yearsLabel(from: number | null, to: number | null): string | null {
    if (from && to) return from === to ? String(from) : `${from}–${to}`;
    if (from) return `${from} onwards`;
    if (to) return `Up to ${to}`;
    return null;
}

/** A year from the URL or an input, or null if missing or out of range. */
function parseYear(value: string | null): number | null {
    const year = Number(value);
    return Number.isInteger(year) && year >= YEAR_MIN && year <= YEAR_MAX ? year : null;
}

/** "_" joins multiple values in the URL and the API, e.g. genres=Action_Drama. */
const splitParam = (value: string | null) => (value ? value.split('_').filter(Boolean) : []);

interface SearchFilters {
    query: string;
    genres: string[];
    tags: string[];
    ratings: string[];
    yearFrom: number | null;
    yearTo: number | null;
    priceMin: number | null;
    priceMax: number | null;
}

function searchUrl(f: SearchFilters, sort: SortKey, page: number, limit: number) {
    // `page` is 1-based in the UI; the API (Spring Data) is 0-based.
    const params = [`page=${page - 1}`, `limit=${limit}`, SORTS[sort].params];
    if (f.query) params.push(`query=${encodeURIComponent(f.query)}`);
    if (f.genres.length) params.push(`genres=${f.genres.map(encodeURIComponent).join('_')}`);
    if (f.tags.length) params.push(`tags=${f.tags.join('_')}`);
    if (f.ratings.length) {
        const values = f.ratings.flatMap((key) => CONTENT_RATINGS.find((r) => r.key === key)?.values ?? []);
        if (values.length) params.push(`rated=${values.map(encodeURIComponent).join('_')}`);
    }
    if (f.yearFrom) params.push(`yearFrom=${f.yearFrom}`);
    if (f.yearTo) params.push(`yearTo=${f.yearTo}`);
    // Dollars in the UI, cents in the API.
    if (f.priceMin !== null) params.push(`priceMin=${Math.round(f.priceMin * 100)}`);
    if (f.priceMax !== null) params.push(`priceMax=${Math.round(f.priceMax * 100)}`);
    return `${SEARCH_URL}?${params.join('&')}`;
}

/** A filter chip button, white when selected (genres, ratings, decades). */
function ToggleChip({on, onClick, children}: { on: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={on}
            className={`h-8 cursor-pointer rounded-full px-3 text-[13px] font-semibold ring-1 ring-inset transition-colors ${
                on ? 'bg-white text-black ring-white' : 'bg-black/40 text-white/85 ring-white/15 hover:bg-white/10'
            }`}
        >
            {children}
        </button>
    );
}

/**
 * A pair of From/To boxes (years, prices). Typing only edits a draft; it's
 * applied on Enter or when the box loses focus, so the results don't reload on
 * every keystroke. Either may be left empty, and reversed ends are swapped.
 */
function RangeInputs({from, to, parse, onChange, placeholders, labels, min, max, decimal = false}: {
    from: number | null; to: number | null;
    parse: (value: string) => number | null;
    onChange: (from: number | null, to: number | null) => void;
    placeholders: [string, string]; labels: [string, string];
    min: number; max: number; decimal?: boolean;
}) {
    const show = (n: number | null) => (n === null ? '' : String(n));
    const [draftFrom, setDraftFrom] = useState(show(from));
    const [draftTo, setDraftTo] = useState(show(to));
    // Follow the URL when it changes elsewhere (quick chips, chip removal, back).
    useEffect(() => setDraftFrom(show(from)), [from]);
    useEffect(() => setDraftTo(show(to)), [to]);

    const apply = () => {
        let f = parse(draftFrom);
        let t = parse(draftTo);
        if (f !== null && t !== null && f > t) [f, t] = [t, f];
        setDraftFrom(show(f));
        setDraftTo(show(t));
        if (f !== from || t !== to) onChange(f, t);
    };
    const box = "h-9 w-full min-w-0 rounded-full bg-white/10 px-3.5 text-sm outline-none ring-1 ring-inset ring-white/10 placeholder:text-white/40 focus:ring-white/25";
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') apply(); };
    const common = {type: 'number', inputMode: decimal ? 'decimal' : 'numeric', step: decimal ? 'any' : 1, min, max, onBlur: apply, onKeyDown, className: box} as const;

    return (
        <div className="flex items-center gap-2">
            <input {...common} placeholder={placeholders[0]} aria-label={labels[0]}
                   value={draftFrom} onChange={(e) => setDraftFrom(e.target.value)} />
            <span className="text-white/40">–</span>
            <input {...common} placeholder={placeholders[1]} aria-label={labels[1]}
                   value={draftTo} onChange={(e) => setDraftTo(e.target.value)} />
        </div>
    );
}

/** A select drawn as a chip; options keep a dark background in the open menu. */
function ChipSelect({label, value, onChange, children}: {
    label: string; value: string | number; onChange: (value: string) => void; children: React.ReactNode;
}) {
    return (
        <label className="flex items-center gap-2 text-sm text-white/60">
            <span className="hidden sm:inline">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                className={`${CHIP} cursor-pointer px-3.5 outline-none [&>option]:bg-neutral-900`}
            >
                {children}
            </select>
        </label>
    );
}

const TAG_ROW = 32;

/** Keyword filter: a text box narrows the ~1,000 tags, listed virtually. */
function TagFilter({tags, selected, onToggle}: { tags: TagOption[] | undefined; selected: string[]; onToggle: (id: string) => void }) {
    const [text, setText] = useState('');
    const matches = useMemo(() => {
        const needle = text.trim().toLowerCase();
        return (tags ?? []).filter((t) => !needle || t.name.toLowerCase().includes(needle));
    }, [tags, text]);

    return (
        <div className="flex flex-col gap-2">
            <input
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Find a keyword"
                aria-label="Find a keyword"
                className="h-9 rounded-full bg-white/10 px-3.5 text-sm outline-none ring-1 ring-inset ring-white/10 placeholder:text-white/40 focus:ring-white/25"
            />
            {!tags ? (
                <p className="text-sm text-white/50">Loading keywords…</p>
            ) : matches.length === 0 ? (
                <p className="text-sm text-white/50">No keywords match.</p>
            ) : (
                <List
                    height={Math.min(320, matches.length * TAG_ROW)}
                    itemCount={matches.length}
                    itemSize={TAG_ROW}
                    width="100%"
                    // A dark scrollbar; the default is bright white on the glass panel.
                    className="[scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin]"
                >
                    {({index, style}) => {
                        const tag = matches[index];
                        const id = String(tag.id);
                        return (
                            <label style={style} className="flex cursor-pointer items-center gap-2 truncate text-sm text-white/85">
                                <input type="checkbox" className="accent-white" checked={selected.includes(id)} onChange={() => onToggle(id)} />
                                {tag.name}
                            </label>
                        );
                    }}
                </List>
            )}
        </div>
    );
}

export default function Search() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Everything the page shows comes from the URL, so refresh, back/forward
    // and shared links agree. A new search from the nav bar has no `page`, so
    // it starts at page 1.
    const query = searchParams.get("query") ?? "";
    const genres = splitParam(searchParams.get("genres"));
    const tags = splitParam(searchParams.get("tags"));
    const ratings = splitParam(searchParams.get("rated")).filter((key) => CONTENT_RATINGS.some((r) => r.key === key));
    const yearFrom = parseYear(searchParams.get("from"));
    const yearTo = parseYear(searchParams.get("to"));
    const priceMin = parsePrice(searchParams.get("pmin"));
    const priceMax = parsePrice(searchParams.get("pmax"));
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limitParam = Number(searchParams.get("limit"));
    const limit = (PAGE_SIZES as readonly number[]).includes(limitParam) ? limitParam : DEFAULT_PAGE_SIZE;
    const sortParam = searchParams.get("sort");
    const sort: SortKey = sortParam && sortParam in SORTS ? (sortParam as SortKey) : DEFAULT_SORT;

    const {data, error, isLoading} = useSWR<Page<Movie>>(
        searchUrl({query, genres, tags, ratings, yearFrom, yearTo, priceMin, priceMax}, sort, page, limit), fetcher, {keepPreviousData: true});
    const {data: allTags} = useSWR<TagOption[]>(TAGS_URL, async (url: string) =>
        (await fetcher(url)).map((t: { tag_id: number; name: string }) => ({id: t.tag_id, name: t.name})),
        {revalidateOnFocus: false});
    const tagName = (id: string) => allTags?.find((t) => String(t.id) === id)?.name ?? `Keyword ${id}`;

    // Open beside the results on desktop; collapsed on phones, where it would
    // push the results off screen.
    const [filtersOpen, setFiltersOpen] = useState(false);
    useEffect(() => {
        setFiltersOpen(window.matchMedia('(min-width: 768px)').matches);
    }, []);

    /** Apply changes to the URL's query string; null removes a key. */
    const updateParams = (changes: Record<string, string | number | null>) => {
        const next = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === '') next.delete(key);
            else next.set(key, String(value));
        }
        const qs = next.toString();
        router.push(qs ? `/search?${qs}` : '/search', {scroll: false});
    };
    /** Any filter, sort or size change starts again at page 1. */
    const updateFilters = (changes: Record<string, string | number | null>) => updateParams({...changes, page: null});
    const goToPage = (n: number) => {
        updateParams({page: n > 1 ? n : null});
        window.scrollTo({top: 0});
    };
    const toggleIn = (list: string[], value: string) =>
        (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]).join('_') || null;
    const toggleGenre = (genre: string) => updateFilters({genres: toggleIn(genres, genre)});
    const toggleTag = (id: string) => updateFilters({tags: toggleIn(tags, id)});
    const toggleRating = (key: string) => updateFilters({rated: toggleIn(ratings, key)});
    const setYears = (from: number | null, to: number | null) => updateFilters({from, to});
    const setPrices = (pmin: number | null, pmax: number | null) => updateFilters({pmin, pmax});
    const clearFilters = () => updateFilters({genres: null, tags: null, rated: null, from: null, to: null, pmin: null, pmax: null});
    const years = yearsLabel(yearFrom, yearTo);
    const prices = priceLabel(priceMin, priceMax);

    const heading = query ? `“${query}”`
        : genres.length ? genres.join(' & ')
        : tags.length ? tags.map(tagName).join(', ')
        : ratings.length ? ratingsHeading(ratings)
        : years ? (yearFrom ? `Movies from ${years}` : `Movies ${years.replace(/^Up to/, 'up to')}`)
        : prices ? priceHeading(priceMin, priceMax)
        : 'All movies';
    const total = data?.totalElements;
    const activeCount = genres.length + tags.length + ratings.length + (years ? 1 : 0) + (prices ? 1 : 0);

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-8 text-white">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
                <p className="h-5 text-sm text-white/60">
                    {total !== undefined && `${total.toLocaleString()} ${total === 1 ? 'movie' : 'movies'}`}
                    {query && (genres.length || tags.length) ? ` in ${[...genres, ...tags.map(tagName)].join(', ')}` : ''}
                </p>
            </header>

            {/* Toolbar: filters toggle and active filters on the left, sort and
                page size on the right. */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    aria-expanded={filtersOpen}
                    aria-controls="search-filters"
                    className={`${CHIP} cursor-pointer pl-3 pr-3.5`}
                >
                    <TuneRoundedIcon sx={CHIP_ICON_SIZE} /> Filters
                    {activeCount > 0 && (
                        <span className="ml-0.5 rounded-full bg-white px-1.5 text-xs font-bold text-black">{activeCount}</span>
                    )}
                </button>

                {genres.map((genre) => (
                    <Chip key={`g-${genre}`} label={genre} onDelete={() => toggleGenre(genre)}
                          deleteIcon={<CloseRoundedIcon aria-label={`Remove ${genre}`} />} sx={ACTIVE_CHIP_SX} />
                ))}
                {tags.map((id) => (
                    <Chip key={`t-${id}`} label={tagName(id)} onDelete={() => toggleTag(id)}
                          deleteIcon={<CloseRoundedIcon aria-label={`Remove ${tagName(id)}`} />} sx={ACTIVE_CHIP_SX} />
                ))}
                {ratings.map((key) => (
                    <Chip key={`r-${key}`} label={key === 'NR' ? 'Not rated' : `Rated ${ratingLabel(key)}`} onDelete={() => toggleRating(key)}
                          deleteIcon={<CloseRoundedIcon aria-label={`Remove rating ${ratingLabel(key)}`} />} sx={ACTIVE_CHIP_SX} />
                ))}
                {years && (
                    <Chip key="years" label={years} onDelete={() => setYears(null, null)}
                          deleteIcon={<CloseRoundedIcon aria-label="Remove year filter" />} sx={ACTIVE_CHIP_SX} />
                )}
                {prices && (
                    <Chip key="prices" label={prices} onDelete={() => setPrices(null, null)}
                          deleteIcon={<CloseRoundedIcon aria-label="Remove price filter" />} sx={ACTIVE_CHIP_SX} />
                )}
                {activeCount > 1 && (
                    <button type="button" onClick={clearFilters} className="cursor-pointer px-2 text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
                        Clear all
                    </button>
                )}

                <div className="ml-auto flex items-center gap-3">
                    <ChipSelect label="Sort" value={sort} onChange={(v) => updateFilters({sort: v === DEFAULT_SORT ? null : v})}>
                        {(Object.keys(SORTS) as SortKey[]).map((key) => <option key={key} value={key}>{SORTS[key].label}</option>)}
                    </ChipSelect>
                    <ChipSelect label="Per page" value={limit} onChange={(v) => updateFilters({limit: Number(v) === DEFAULT_PAGE_SIZE ? null : v})}>
                        {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
                    </ChipSelect>
                </div>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {filtersOpen && (
                    <aside id="search-filters" aria-label="Filters" className={`flex w-full shrink-0 flex-col gap-5 rounded-2xl p-4 md:sticky md:top-20 md:w-64 ${GLASS_CARD}`}>
                        <section className="flex flex-col gap-2">
                            <h2 className="text-sm font-semibold text-white/70">Genres</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {GENRES.map((genre) => (
                                    <ToggleChip key={genre} on={genres.includes(genre)} onClick={() => toggleGenre(genre)}>{genre}</ToggleChip>
                                ))}
                            </div>
                        </section>
                        <section className="flex flex-col gap-2">
                            <h2 className="text-sm font-semibold text-white/70">Rating</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {CONTENT_RATINGS.map((r) => (
                                    <ToggleChip key={r.key} on={ratings.includes(r.key)} onClick={() => toggleRating(r.key)}>{r.label}</ToggleChip>
                                ))}
                            </div>
                        </section>
                        <section className="flex flex-col gap-2">
                            <h2 className="text-sm font-semibold text-white/70">Years</h2>
                            <RangeInputs from={yearFrom} to={yearTo} onChange={setYears} parse={parseYear}
                                         placeholders={['From', 'To']} labels={['From year', 'To year']} min={YEAR_MIN} max={YEAR_MAX} />
                            <div className="flex flex-wrap gap-1.5">
                                {DECADES.map((d) => {
                                    const on = (d.from ?? null) === yearFrom && (d.to ?? null) === yearTo;
                                    return (
                                        <ToggleChip key={d.label} on={on} onClick={() => (on ? setYears(null, null) : setYears(d.from ?? null, d.to ?? null))}>
                                            {d.label}
                                        </ToggleChip>
                                    );
                                })}
                            </div>
                        </section>
                        <section className="flex flex-col gap-2">
                            <h2 className="text-sm font-semibold text-white/70">Price</h2>
                            <RangeInputs from={priceMin} to={priceMax} onChange={setPrices} parse={parsePrice}
                                         placeholders={['$ Min', '$ Max']} labels={['Minimum price in dollars', 'Maximum price in dollars']}
                                         min={0} max={PRICE_MAX} decimal />
                            <div className="flex flex-wrap gap-1.5">
                                {PRICE_BANDS.map((b) => {
                                    const [min, max] = [b.min ?? null, b.max ?? null];
                                    const on = min === priceMin && max === priceMax;
                                    return (
                                        <ToggleChip key={priceLabel(min, max)} on={on} onClick={() => (on ? setPrices(null, null) : setPrices(min, max))}>
                                            {priceLabel(min, max)}
                                        </ToggleChip>
                                    );
                                })}
                            </div>
                        </section>
                        <section className="flex flex-col gap-2">
                            <h2 className="text-sm font-semibold text-white/70">Keywords</h2>
                            <TagFilter tags={allTags} selected={tags} onToggle={toggleTag} />
                        </section>
                    </aside>
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-6">
                    {error ? (
                        <p className="py-10 text-center text-white/60">Couldn&apos;t load results. Try again in a moment.</p>
                    ) : isLoading && !data ? (
                        <MovieGridSkeleton count={limit} label="Loading results" />
                    ) : data && data.content.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <p className="text-white/70">No movies match {activeCount ? 'these filters' : 'this search'}.</p>
                            {activeCount > 0 && (
                                <button type="button" onClick={clearFilters} className={`${CHIP} cursor-pointer px-4`}>Clear filters</button>
                            )}
                        </div>
                    ) : data ? (
                        <>
                            {/* Dim, rather than blank, while the next page loads. */}
                            <ul className={`${MOVIE_GRID} transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
                                {data.content.map((movie) => <li key={movie.id}><MovieCard movie={movie} /></li>)}
                            </ul>
                            <Pager page={page} totalPages={data.totalPages} onPage={goToPage} />
                        </>
                    ) : null}
                </div>
            </div>
        </main>
    );
}

/** Active-filter chips: the shared chip look plus a clearly visible ✕. */
const ACTIVE_CHIP_SX = {
    ...CHIP_SX,
    '& .MuiChip-label': { ...CHIP_SX['& .MuiChip-label'], paddingRight: '6px' },
    '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)', fontSize: 18, marginRight: '8px', '&:hover': { color: 'white' } },
} as const;
