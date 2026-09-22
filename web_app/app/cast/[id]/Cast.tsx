
"use client"
import useSWR from "swr";
import ProfileImage from "@/app/components/ProfileImage";
import {useEffect, useId, useRef, useState} from "react";
import {Movie} from "@/lib/models/Movie";
import {Page} from "@/lib/models/Page";
import PosterItem from "@/app/ui/PosterItem";
import {CastDetails} from "@/lib/models/CastDetails";
import {optimizerUrl} from "@/lib/image";
import ScrollZoomBackdrop from "@/app/components/ScrollZoomBackdrop";


interface CastProps {
    id: string;
}

const API_URL_MOVIES: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/cast/`;
const API_URL_CAST: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/cast/`;


/** "archive_footage" → "Archive footage". */
function humanize(category: string): string {
    const text = category.replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * This person's credit on a film: the characters for an acting role
 * ("as Batman / Bruce Wayne"), otherwise the job ("Writer", "Director").
 */
function roleFor(movie: Movie, castId: string): string | null {
    const credits = (movie.cast ?? []).filter((c) => c.id === castId);
    if (credits.length === 0) return null;

    // Credits can have no characters, and even no category (Joaquin Phoenix
    // in Earthlings has category: null), so check both before using them.
    const acting = credits.find((c) => /^(actor|actress|self)$/.test(c.category ?? '') && c.characters?.length);
    if (acting) return `as ${acting.characters.join(' / ')}`;

    const jobs = credits.map((c) => c.category).filter((c): c is string => !!c);
    return jobs.length ? [...new Set(jobs.map(humanize))].join(', ') : null;
}

/** "1915–1998", "Born 1915", or null. Dates arrive as "YYYY-MM-DD". */
function lifespan(dob?: string, dod?: string): string | null {
    const born = /^\d{4}/.exec(dob ?? '')?.[0];
    const died = /^\d{4}/.exec(dod ?? '')?.[0];
    if (born && died) return `${born}–${died}`;
    if (born) return `Born ${born}`;
    if (died) return `Died ${died}`;
    return null;
}

// Left-aligned so the posters line up with the heading above them; centred on
// phones, where a single column would otherwise hug the left edge.
const FILM_GRID = "grid grid-cols-[repeat(auto-fill,200px)] justify-center sm:justify-start gap-x-4 gap-y-6";

function FilmsSkeleton() {
    return (
        <div role="status" aria-label="Loading films" className="flex flex-col gap-4 motion-safe:animate-pulse">
            <div className="h-6 w-40 rounded bg-white/10" />
            <div className={FILM_GRID}>
                {Array.from({length: 8}, (_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div className="h-[300px] w-[200px] rounded-lg bg-white/5" />
                        <div className="h-4 w-3/4 rounded bg-white/10" />
                        <div className="h-3 w-1/2 rounded bg-white/5" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function Films({castId}: { castId: string }) {
    // Newest first. Without sortBy the API returns database order, which jumps
    // around (1997, 1991, 1968, …).
    const {data, error} = useSWR<Page<Movie>>(`${API_URL_MOVIES}${castId}?limit=${FILM_LIMIT}&sortBy=year`, fetcher, {
        revalidateOnFocus: false,
        refreshInterval: 0,
    });

    if (error) return <p className="text-sm text-white/60">Couldn&apos;t load films.</p>;
    if (!data) return <FilmsSkeleton />;

    const films = data.content;
    const total = data.totalElements ?? films.length;

    return (
        <section aria-labelledby="filmography" className="flex flex-col gap-4">
            <h2 id="filmography" className="text-xl font-semibold text-white">
                Filmography <span className="font-normal text-white/40">{total}</span>
            </h2>

            {films.length === 0 ? (
                <p className="text-sm text-white/60">No films found.</p>
            ) : (
                <ul className={FILM_GRID}>
                    {films.map((movie) => {
                        const meta = [roleFor(movie, castId), movie.year].filter(Boolean).join(' · ');
                        return (
                            <li key={movie.id} className="flex flex-col gap-2">
                                <PosterItem item={movie} size="small" />
                                <div className="flex w-[200px] flex-col">
                                    <p className="truncate text-sm font-medium text-white" title={movie.title}>
                                        {movie.title}
                                    </p>
                                    {meta && (
                                        <p className="truncate text-xs text-white/50" title={meta}>{meta}</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {total > films.length && (
                <p className="text-xs text-white/40">Showing {films.length} of {total}</p>
            )}
        </section>
    );
}

const FILM_LIMIT = 50;

// res.json() alone treats a 404 body as data, which rendered an empty page
// instead of the error state.
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    return res.json();
};

/**
 * The source bios run sentences together ("…in 1996.Kane was born…"). Add the
 * missing space after a full stop that follows a lowercase letter, digit or
 * closing bracket and precedes a capitalised word, which leaves initials and
 * abbreviations like "U.S.A." alone.
 */
function tidyBio(bio: string): string {
    return bio.replace(/([a-z0-9)])\.(?=[A-Z][a-z])/g, '$1. ');
}

const COLLAPSED_LINES = 5;

/**
 * The bio, clipped to COLLAPSED_LINES with a soft fade, expanding and
 * collapsing smoothly. The full text is always rendered and only its visible
 * height animates, measured from the content so it's right at any width.
 */
function Bio({text}: { text: string }) {
    const [expanded, setExpanded] = useState(false);
    const [fullHeight, setFullHeight] = useState<number | null>(null);
    const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const id = useId();

    // Re-measure when the width changes, since that changes the line wrap.
    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const measure = () => {
            const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
            setFullHeight(el.scrollHeight);
            setCollapsedHeight(Math.round(lineHeight * COLLAPSED_LINES));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [text]);

    const clamps = fullHeight !== null && collapsedHeight !== null && fullHeight > collapsedHeight + 1;
    const clipped = clamps && !expanded;

    return (
        <div className="flex w-full flex-col items-start gap-1">
            <div
                id={id}
                className="w-full overflow-hidden transition-[max-height,mask-size] duration-500 ease-in-out motion-reduce:transition-none"
                style={{
                    // Before the first measurement, clamp by line count so the
                    // full bio never flashes open on load.
                    maxHeight: clamps
                        ? (expanded ? fullHeight! : collapsedHeight!)
                        : (fullHeight === null ? `${COLLAPSED_LINES * 1.5}em` : undefined),
                    // Fade the last line out while clipped. Animating the mask
                    // size (rather than swapping the mask) keeps the fade in
                    // step with the height.
                    maskImage: 'linear-gradient(to bottom, black calc(100% - 3em), transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 3em), transparent)',
                    maskSize: clipped ? '100% 100%' : '100% calc(100% + 3em)',
                    WebkitMaskSize: clipped ? '100% 100%' : '100% calc(100% + 3em)',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                }}
            >
                <div ref={contentRef} className="text-md text-white">
                    {text}
                </div>
            </div>

            {clamps && (
                <button
                    type="button"
                    onClick={() => {
                        // Measure again on click: a reflow since the last
                        // ResizeObserver callback (fonts, scrollbar) would
                        // otherwise leave the last line cut off.
                        if (contentRef.current) setFullHeight(contentRef.current.scrollHeight);
                        setExpanded((e) => !e);
                    }}
                    aria-expanded={expanded}
                    aria-controls={id}
                    className="cursor-pointer text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </div>
    );
}
function HeaderSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading"
            className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 pb-10 pt-10 motion-safe:animate-pulse md:flex-row md:items-start md:gap-10"
        >
            <div className="h-[180px] w-[180px] shrink-0 rounded-full bg-white/10" />
            <div className="flex w-full flex-col items-center gap-3 md:items-start">
                <div className="h-9 w-56 rounded bg-white/10" />
                <div className="h-4 w-72 max-w-full rounded bg-white/5" />
                <div className="mt-2 flex w-full max-w-prose flex-col gap-2">
                    {Array.from({length: 5}, (_, i) => (
                        <div key={i} className={`h-4 rounded bg-white/5 ${i === 4 ? 'w-2/3' : 'w-full'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Cast({ id }: CastProps) {
    const {data, error} = useSWR<CastDetails>(`${API_URL_CAST}${id}`, fetcher, {
        revalidateOnFocus: false,
        refreshInterval: 0,
    });

    if (error) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-16 text-center text-white/60">
                Couldn&apos;t load this person.
            </main>
        );
    }

    // The API answers an unknown id with 200 and a body of `null`, so null
    // means "not found"; only undefined means still loading.
    if (data === null) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-16 text-center text-white/60">
                We couldn&apos;t find this person.
            </main>
        );
    }

    if (!data) {
        return (
            <main className="pb-16">
                <HeaderSkeleton />
                <div className="mx-auto max-w-5xl px-4">
                    <FilmsSkeleton />
                </div>
            </main>
        );
    }

    const bio = tidyBio(data.bio ?? '');
    const meta = [lifespan(data.dob, data.dod), data.birthplace].filter(Boolean).join(' · ');
    // The page's soft background is the photo itself, heavily blurred, so
    // a small copy is plenty.
    const backdrop = data.photo ? optimizerUrl(data.photo, 256) ?? data.photo : null;

    return (
        // isolate keeps the backdrop's -z-10 inside this page rather than
        // behind the body.
        <main className="relative isolate pb-16">
            {backdrop && <ScrollZoomBackdrop src={backdrop} />}

            <header>
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 pb-10 pt-10 md:flex-row md:items-start md:gap-10">
                    <ProfileImage
                        name={data.name}
                        imageUrl={data.photo}
                        size={180}
                        className="shrink-0 shadow-2xl ring-1 ring-white/15"
                    />

                    <div className="flex w-full min-w-0 flex-col items-center gap-3 md:items-start">
                        <h1 className="text-center text-3xl font-semibold tracking-tight text-white md:text-left md:text-4xl">
                            {data.name}
                        </h1>
                        {meta && (
                            <p className="text-center text-sm text-white/70 md:text-left">{meta}</p>
                        )}
                        {bio && (
                            <div className="w-full max-w-prose">
                                <Bio text={bio} />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-4">
                <Films castId={id} />
            </div>
        </main>
    );
}
