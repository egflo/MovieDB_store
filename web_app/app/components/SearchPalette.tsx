'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { suggestMovies, suggestPeople, MovieSuggestion, PersonSuggestion } from '@/lib/api/autocomplete';
import { pickScore } from '@/lib/score';
import { Rating } from '@/lib/models/Rating';
import { GLASS_CARD } from '@/app/ui/glass';
import PosterThumb from '@/app/ui/PosterThumb';
import { optimizedImage } from '@/lib/image';

/** Suggestions start at two characters; one matches most of the catalogue. */
const MIN_CHARS = 2;
/** Wait this long after the last keystroke before asking. */
const DEBOUNCE_MS = 150;
const MOVIE_LIMIT = 5;
const PEOPLE_LIMIT = 3;

const searchHref = (text: string) => `/search?query=${encodeURIComponent(text)}`;

/** One character without its accent ("é" -> "e"), lowercased: the service matches this way. */
const fold = (ch: string) => ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/**
 * The title with the first match of `text` in bold, found the way the
 * service matches (case and accents ignored), so "amelie" marks "Amélie".
 */
function Highlight({ title, text }: { title: string; text: string }) {
    const chars = Array.from(title);
    const folded = chars.map(fold);
    // Only when folding kept one character per character, so indexes line up.
    if (folded.every((c) => c.length === 1)) {
        const needle = Array.from(text).map(fold).join('');
        const at = folded.join('').indexOf(needle);
        if (needle && at >= 0) {
            const end = at + Array.from(needle).length;
            return (
                <>
                    {chars.slice(0, at).join('')}
                    <mark className="bg-transparent font-semibold text-white">{chars.slice(at, end).join('')}</mark>
                    {chars.slice(end).join('')}
                </>
            );
        }
    }
    return <>{title}</>;
}

function RowsSkeleton({ rows, round = false }: { rows: number; round?: boolean }) {
    const bar = 'animate-pulse rounded bg-white/10';
    return (
        <div aria-hidden className="flex flex-col gap-0.5">
            {Array.from({ length: rows }, (_, n) => (
                <div key={n} className="mx-2 flex items-center gap-3 px-3 py-2">
                    <span className={`${round ? 'size-9 rounded-full' : 'h-[54px] w-9'} ${bar}`} />
                    <span className="flex flex-col gap-2">
                        <span className={`h-3.5 w-48 ${bar}`} />
                        <span className={`h-3 w-24 ${bar}`} />
                    </span>
                </div>
            ))}
        </div>
    );
}

/** A round, resized photo; their initial when there's none or it fails (many stored photo links are dead). */
function PersonThumb({ name, url }: { name: string; url: string | null }) {
    const [failed, setFailed] = useState(false);
    const box = 'size-9 shrink-0 rounded-full ring-1 ring-inset ring-white/10';
    if (!url || failed) {
        return (
            <span aria-hidden className={`flex items-center justify-center bg-white/10 text-sm font-semibold text-white/70 ${box}`}>
                {name.trim().charAt(0).toUpperCase()}
            </span>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...optimizedImage(url, 36, 36)} alt="" decoding="async" onError={() => setFailed(true)}
             className={`object-cover object-top ${box}`} />
    );
}

/** "Actor", "Actress, Director": the credit categories as the site says them. */
function rolesLabel(roles: string[]) {
    const names: Record<string, string> = { actor: 'Actor', actress: 'Actress', director: 'Director', self: 'Self' };
    return roles.map((r) => names[r] ?? r).join(', ');
}

/** A section's small heading inside the list. */
function GroupLabel({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <div id={id} role="presentation" className="px-5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {children}
        </div>
    );
}

/**
 * Search as a dialog over the page: type, pick a suggestion with the mouse
 * or ↑↓ and Enter, or press Enter (or "See all") for the full search page
 * with its filters. Two groups: movies (/movie/autocomplete) and, below a
 * divider, people (/cast/autocomplete), both ranked by how the text
 * matches. They're asked for together; movies usually answer first, so
 * people show a placeholder until theirs arrive. Rendered into <body>:
 * inside the nav, whose backdrop-filter makes it the containing block, a
 * fixed overlay would be trapped in the bar.
 */
export default function SearchPalette({ initialText = '', onClose, returnFocusTo }: {
    initialText?: string;
    onClose: () => void;
    /** Focused again when the box closes without going anywhere (Esc, Cancel, a click outside). */
    returnFocusTo?: React.RefObject<HTMLElement | null>;
}) {
    const router = useRouter();
    const listId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
    // Set when closing because we're navigating: the new page keeps its own focus.
    const leaving = useRef(false);

    const [text, setText] = useState(initialText);
    // Each list with the text it answers. null until something has been
    // asked; kept while the next request runs, so the list doesn't blank on
    // every keystroke.
    const [movieResults, setMovieResults] = useState<{ for: string; rows: MovieSuggestion[] } | null>(null);
    const [peopleResults, setPeopleResults] = useState<{ for: string; rows: PersonSuggestion[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    // The highlighted option; -1 is the input itself, where Enter means "search".
    const [active, setActive] = useState(-1);

    const query = text.trim();
    const asking = query.length >= MIN_CHARS;

    useEffect(() => {
        if (!asking) {
            setMovieResults(null);
            setPeopleResults(null);
            setLoading(false);
            setFailed(false);
            return;
        }
        const controller = new AbortController();
        const { signal } = controller;
        setLoading(true);
        const timer = setTimeout(() => {
            const movies = suggestMovies(query, { limit: MOVIE_LIMIT, signal })
                .then((rows) => {
                    setMovieResults({ for: query, rows });
                    setFailed(false);
                    setActive(-1);
                })
                .catch((e) => {
                    if (signal.aborted) return; // replaced by a newer keystroke
                    console.warn('Movie suggestions failed', e);
                    setFailed(true);
                });
            // People are extra: if they fail, the section just stays away.
            const people = suggestPeople(query, { limit: PEOPLE_LIMIT, signal })
                .then((rows) => setPeopleResults({ for: query, rows }))
                .catch((e) => {
                    if (signal.aborted) return;
                    console.warn('People suggestions failed', e);
                    setPeopleResults({ for: query, rows: [] });
                });
            Promise.allSettled([movies, people]).then(() => {
                if (!signal.aborted) setLoading(false);
            });
        }, DEBOUNCE_MS);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, asking]);

    // Focus the field, freeze the page behind, and give focus back on close.
    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = overflow;
            if (!leaving.current) returnFocusTo?.current?.focus();
        };
    }, [onClose, returnFocusTo]);

    const movies = asking && movieResults ? movieResults.rows : [];
    const matchedText = movieResults?.for ?? '';
    // People only alongside the movies for the same text, so an older
    // answer never sits under newer movies.
    const peopleReady = asking && !!peopleResults && !!movieResults && peopleResults.for === movieResults.for;
    const people = peopleReady ? peopleResults!.rows : [];
    const peoplePending = asking && !!movieResults && !failed && !peopleReady;

    const settled = asking && !loading && movieResults?.for === query && peopleResults?.for === query;
    const noMatches = settled && movies.length === 0 && people.length === 0;
    // "See all" (the movie search page) is the last option whenever there's
    // text, unless nothing at all matched this very text.
    const showSeeAll = query.length > 0 && !noMatches;

    const options: string[] = [
        ...movies.map((m) => `/movie/${m.id}`),
        ...people.map((p) => `/cast/${p.id}`),
        ...(showSeeAll ? [searchHref(query)] : []),
    ];
    const seeAllIndex = movies.length + people.length;
    const optionId = (n: number) => `${listId}-option-${n}`;
    // The list can shrink under the highlight (fewer results, "See all" gone).
    const current = active < options.length ? active : -1;

    useEffect(() => {
        if (current >= 0) optionRefs.current[current]?.scrollIntoView({ block: 'nearest' });
    }, [current]);

    function go(href: string) {
        leaving.current = true;
        onClose();
        router.push(href);
    }

    /** A suggestion or "See all" clicked: the Link navigates, we just close. */
    function followed() {
        leaving.current = true;
        onClose();
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(Math.min(current + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(Math.max(current - 1, -1));
        } else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (current >= 0) go(options[current]);
            else if (query) go(searchHref(query));
        }
    }

    const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
    const status =
        !asking ? '' :
        failed && !movies.length ? 'Suggestions are unavailable.' :
        noMatches ? `Nothing matches ${query}.` :
        movies.length || people.length
            ? `${[movies.length && count(movies.length, 'movie', 'movies'), people.length && count(people.length, 'person', 'people')].filter(Boolean).join(' and ')}. Use the arrow keys to choose.`
            : '';

    const row = (n: number) =>
        `mx-2 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${current === n ? 'bg-white/10' : ''}`;

    /** Props every option shares: its id for aria-activedescendant, the highlight, the ref to scroll it into view. */
    const optionProps = (n: number) => ({
        id: optionId(n),
        role: 'option' as const,
        'aria-selected': current === n,
        ref: (el: HTMLDivElement | null) => { optionRefs.current[n] = el; },
        onMouseMove: () => setActive(n),
    });

    return createPortal(
        <div className="fixed inset-0 z-[60] text-white">
            <div
                aria-hidden
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-150 starting:opacity-0"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                // Full screen on phones (the keyboard takes half of it); a
                // centred panel from sm up.
                className={`relative flex h-full w-full flex-col overflow-hidden bg-neutral-900/80 transition-[opacity,transform] duration-150 starting:scale-[0.98] starting:opacity-0 sm:mx-auto sm:mt-[12vh] sm:h-auto sm:max-h-[70vh] sm:w-[min(640px,calc(100vw-2rem))] sm:rounded-2xl ${GLASS_CARD}`}
            >
                <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 px-4">
                    <SearchRoundedIcon fontSize="small" className="text-white/60" aria-hidden />
                    <input
                        ref={inputRef}
                        type="search"
                        role="combobox"
                        aria-label="Search movies and people"
                        aria-expanded={options.length > 0}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-activedescendant={current >= 0 ? optionId(current) : undefined}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Movies and people"
                        enterKeyHint="search"
                        autoComplete="off"
                        spellCheck={false}
                        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-white/40 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {loading && <span aria-hidden className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-white/50 border-r-transparent" />}
                    {text && (
                        <button
                            type="button"
                            aria-label="Clear"
                            onClick={() => { setText(''); inputRef.current?.focus(); }}
                            className="shrink-0 cursor-pointer rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
                        >
                            <CloseRoundedIcon sx={{ fontSize: 18 }} />
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="shrink-0 cursor-pointer text-sm text-white/70 hover:text-white sm:hidden">
                        Cancel
                    </button>
                    <kbd className="hidden shrink-0 rounded-md px-1.5 py-0.5 font-sans text-[11px] text-white/50 ring-1 ring-inset ring-white/15 sm:inline">esc</kbd>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
                    <p role="status" className="sr-only">{status}</p>

                    {!query && (
                        <p className="px-5 py-3 text-sm text-white/50">Type a movie title or a name.</p>
                    )}

                    {asking && !movieResults && !failed && <RowsSkeleton rows={3} />}

                    {asking && failed && movies.length === 0 && (
                        <p className="px-5 py-3 text-sm text-white/60">Couldn’t load suggestions. Press Enter to search anyway.</p>
                    )}

                    {noMatches && (
                        <p className="px-5 py-3 text-sm text-white/60">Nothing matches “{query}”.</p>
                    )}

                    {options.length > 0 && (
                        <div id={listId} role="listbox" aria-label="Suggestions"
                             className={`flex flex-col transition-opacity ${loading && movieResults?.for !== query ? 'opacity-70' : ''}`}>
                            {movies.length > 0 && (
                                <div role="group" aria-labelledby={`${listId}-movies`} className="flex flex-col gap-0.5">
                                    <GroupLabel id={`${listId}-movies`}>Movies</GroupLabel>
                                    {movies.map((m, n) => {
                                        const score = pickScore(m.ratings as Rating | null);
                                        return (
                                            <div key={m.id} {...optionProps(n)}>
                                                <Link href={`/movie/${m.id}`} tabIndex={-1} onClick={followed} className={row(n)}>
                                                    <PosterThumb url={m.poster ?? undefined} width={36} height={54} className="block h-[54px] w-9" />
                                                    <span className="flex min-w-0 flex-1 flex-col">
                                                        <span className="truncate text-sm text-white/85"><Highlight title={m.title} text={matchedText} /></span>
                                                        {m.year && <span className="text-xs text-white/50">{m.year}</span>}
                                                    </span>
                                                    {score && (
                                                        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold" title={`${score.source}: ${score.value}`}>
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={score.icon} alt={score.source} className="h-3.5 w-auto" />
                                                            {score.value}
                                                        </span>
                                                    )}
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {(people.length > 0 || peoplePending) && (
                                <div role="group" aria-labelledby={`${listId}-people`}
                                     className={`flex flex-col gap-0.5 ${movies.length ? 'mt-1.5 border-t border-white/10 pt-1.5' : ''}`}>
                                    <GroupLabel id={`${listId}-people`}>People</GroupLabel>
                                    {peoplePending && <RowsSkeleton rows={2} round />}
                                    {people.map((p, i) => {
                                        const n = movies.length + i;
                                        return (
                                            <div key={p.id} {...optionProps(n)}>
                                                <Link href={`/cast/${p.id}`} tabIndex={-1} onClick={followed} className={row(n)}>
                                                    <PersonThumb name={p.name} url={p.photo} />
                                                    <span className="flex min-w-0 flex-1 flex-col">
                                                        <span className="truncate text-sm text-white/85"><Highlight title={p.name} text={matchedText} /></span>
                                                        <span className="truncate text-xs text-white/50">
                                                            {rolesLabel(p.roles)}{p.knownFor && <> · <i className="not-italic text-white/60">{p.knownFor}</i></>}
                                                        </span>
                                                    </span>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {showSeeAll && (
                                <div {...optionProps(seeAllIndex)}
                                     className={movies.length || people.length || peoplePending ? 'mt-1.5 border-t border-white/10 pt-1.5' : ''}>
                                    <Link href={searchHref(query)} tabIndex={-1} onClick={followed} className={`${row(seeAllIndex)} text-sm text-white/80`}>
                                        <span className="flex w-9 justify-center"><SearchRoundedIcon fontSize="small" className="text-white/60" /></span>
                                        <span className="min-w-0 flex-1 truncate">See all movies for “{query}”</span>
                                        {/* Enter does this from the field too, unless a row is highlighted. */}
                                        {(current === -1 || current === seeAllIndex) && (
                                            <kbd className="hidden rounded-md px-1.5 py-0.5 font-sans text-[11px] text-white/50 ring-1 ring-inset ring-white/15 sm:inline">↵</kbd>
                                        )}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="hidden shrink-0 gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-white/40 sm:flex">
                    <span>↑↓ to choose</span>
                    <span>↵ to open</span>
                    <span>esc to close</span>
                </p>
            </div>
        </div>,
        document.body,
    );
}
