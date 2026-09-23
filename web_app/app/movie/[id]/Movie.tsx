"use client"
import useSWR from 'swr';
import RatingsSection from "@/app/ui/RatingsSection";
import InfiniteScrollableContainer from "@/app/components/InfiniteScrollableContainer";
import ScrollableContainer from "@/app/components/ScrollableContainer";
import CastItem from "@/app/ui/CastItem";
import CriticReviewItem from "@/app/ui/CriticReviewItem";
import UserReviewItem from "@/app/ui/UserReviewItem";
import {Chip} from "@mui/material";
import Cart from "@/app/components/actions/Cart";
import Favorite from "@/app/components/actions/Favorite";
import Rate from "@/app/components/actions/Rate";
import Share from "@/app/components/actions/Share";
import {Tag} from "@/lib/models/Tag";
import type {Movie as MovieModel} from "@/lib/models/Movie";
import Box from "@mui/material/Box";
import PosterImage from "@/app/components/PosterImage";
import SubSection, {formatRuntime} from "@/app/ui/SubSection";
import {useAuth} from "@/lib/firebase/AuthContext";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import ScrollZoomBackdrop from "@/app/components/ScrollZoomBackdrop";
import {optimizedImage} from "@/lib/image";
import {CHIP_SX} from "@/app/ui/chip";
import {MovieCard} from "@/app/ui/MovieCard";


const CRITIC_REVIEW_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/critic/movie/`;
const USER_REVIEW_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/review/movie/`;
const SUGGESTION_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/suggest/`;


// res.json() alone treats an error body as data. The API answers an unknown
// movie id with a 500, and rendering that error object as a movie crashed the
// ratings section ("reading 'imdb'").
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    return res.json();
};

/** "David Franzoni, David Franzoni" → ["David Franzoni"]; the data repeats names. */
function uniqueNames(list: string): string[] {
    return [...new Set(list.split(',').map((name) => name.trim()).filter(Boolean))];
}

/** Related movies as the shared poster card (glass caption, score, heart), at
 *  the fixed small size a scrolling row needs. The row only passes `item`. */
function RelatedPoster({item}: { item: MovieModel }) {
    return <MovieCard movie={item} size="small" />;
}

/**
 * The Information grid's entries, in display order, skipping empty fields so
 * they don't leave gaps. Awards is wide: it's a sentence, not a name.
 */
function infoItems(data: any): { label: string; values: string[]; wide?: boolean }[] {
    const items: { label: string; values: string[]; wide?: boolean }[] = [];
    const add = (label: string, value: unknown, wide = false) => {
        if (typeof value === 'string' && value.trim() && value !== 'N/A') items.push({label, values: [value.trim()], wide});
    };
    add('Director', data.director);
    if (data.writer) {
        const writers = uniqueNames(data.writer);
        if (writers.length) items.push({label: writers.length > 1 ? 'Writers' : 'Writer', values: writers});
    }
    add('Production', data.production);
    add('Language', data.language);
    add('Country', data.country);
    add('Box office', data.boxOffice);
    add('Runtime', formatRuntime(data.runtime) ?? undefined);
    add('Awards', data.awards, true);
    return items;
}

/** Placeholder in the shape of the page while the movie loads. */
function MovieSkeleton() {
    return (
        <div role="status" aria-label="Loading movie" className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-4 pt-8 motion-safe:animate-pulse">
            <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="h-[310px] w-[220px] shrink-0 rounded-lg bg-white/10" />
                <div className="flex w-full max-w-xl flex-col items-center gap-3 md:items-start">
                    <div className="h-[60px] w-[200px] rounded bg-white/10" />
                    <div className="h-4 w-40 rounded bg-white/5" />
                    <div className="h-10 w-72 max-w-full rounded bg-white/5" />
                    <div className="flex w-full flex-col gap-2">
                        <div className="h-4 w-full rounded bg-white/5" />
                        <div className="h-4 w-5/6 rounded bg-white/5" />
                    </div>
                    <div className="flex gap-2">
                        {Array.from({length: 4}, (_, i) => (
                            <div key={i} className="h-10 w-10 rounded-full bg-white/10" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="h-6 w-32 rounded bg-white/10" />
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({length: 8}, (_, i) => (
                        <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                            <div className="h-[100px] w-[100px] rounded-full bg-white/10" />
                            <div className="h-3 w-20 rounded bg-white/5" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="h-6 w-36 rounded bg-white/10" />
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({length: 4}, (_, i) => (
                        <div key={i} className="h-[200px] w-[300px] shrink-0 rounded-xl bg-white/5" />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Poster size when there's nothing to match, and on phones, where the
 *  poster sits above the details rather than beside them. */
const POSTER_MIN = {width: 220, height: 310};
const POSTER_ASPECT = 2 / 3;
/** A wider poster narrows the details column, which can make it wrap and grow
 *  taller, which widens the poster again. That settles, but on a narrow
 *  window it could settle very large, so cap it. */
const POSTER_MAX_HEIGHT = 480;

/**
 * Poster dimensions that match the height of the details column beside it,
 * at the poster's 2:3 shape, never smaller than POSTER_MIN. Only applies from
 * the md breakpoint, where the two sit side by side. Measured with a
 * ResizeObserver because CSS can't reliably derive a width from a stretched
 * height.
 */
function usePosterMatchingHeight(details: React.RefObject<HTMLElement | null>, ready: boolean) {
    const [size, setSize] = useState(POSTER_MIN);

    useEffect(() => {
        const el = details.current;
        if (!ready || !el) return;
        const sideBySide = window.matchMedia('(min-width: 768px)');

        const update = () => {
            if (!sideBySide.matches) {
                setSize(POSTER_MIN);
                return;
            }
            const measured = Math.round(el.getBoundingClientRect().height);
            const height = Math.min(POSTER_MAX_HEIGHT, Math.max(POSTER_MIN.height, measured));
            const width = Math.round(height * POSTER_ASPECT);
            // Bail out on no change so a resize doesn't re-render needlessly.
            setSize((prev) => (prev.height === height && prev.width === width ? prev : {width, height}));
        };

        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        sideBySide.addEventListener('change', update);
        return () => {
            observer.disconnect();
            sideBySide.removeEventListener('change', update);
        };
    }, [details, ready]);

    return size;
}

export default function Movie({id}: { id: string }) {

    const auth = useAuth();
    const router = useRouter();

    const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/${id}`;
    const { data, error } = useSWR(URL, fetcher);
    // Above the early returns so hook order stays fixed.
    const detailsRef = useRef<HTMLDivElement>(null);
    const poster = usePosterMatchingHeight(detailsRef, !!data);

    const testURL = (url: string) => {
        return url && url.startsWith("http") && (url.endsWith(".jpg") || url.endsWith(".png") || url.endsWith(".jpeg"));
    }

    // The API has no "not found" response (an unknown id is a 500), so any
    // failure reads as not found, and so does a null body.
    if (error || data === null) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-16 text-center text-white/60">
                We couldn&apos;t find this movie.
            </main>
        );
    }
    if (!data) return <MovieSkeleton />

    // The background, else the poster; neither when the data has "N/A".
    const backdropUrl = testURL(data.background)
        ? data.background
        : (typeof data.poster === 'string' && data.poster.startsWith('http') ? data.poster : null);

    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <div className={"relative isolate flex flex-col w-full"}>
            {/* The movie's background, fixed behind the whole page and zooming
                in as it scrolls. Lightly blurred so it stays recognisable. */}
            {backdropUrl && (
                <ScrollZoomBackdrop
                    {...optimizedImage(backdropUrl, 1920, 1080, "100vw")}
                    imageClassName="opacity-45 blur-sm"
                    zoomFrom={1.05}
                    zoomTo={1.25}
                />
            )}

            {/* In normal flow rather than absolutely positioned over a fixed-
                height image, so it starts below the sticky nav bar. */}
            {/* One centred column for the whole page, so the poster, the
                section headings and every row share the same left edge. */}
            <div className={'mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-4 pt-8'}>

                {/* Starts at the column's left edge rather than centring on its
                    own, which put it on a different edge from the sections. */}
                <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-start">

                    {/* Sized to match the details column's height (md and up). */}
                    <PosterImage  name={data.title} imageUrl={data.poster} width={poster.width} height={poster.height} className={"shrink-0 rounded-lg"} />

                    <div ref={detailsRef} className="flex flex-col items-center md:items-start gap-1 ">

                        {data.logo &&
                            <Box className={"flex justify-center items-center p-0 m-0  rounded-lg"}>
                                {/* Through the optimizer: fanart.tv logos are full-size
                                    PNGs, often http:// URLs that redirect. Left-aligned
                                    in its box from md up, so a narrow logo starts at
                                    the column's edge like the rows below it. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img {...optimizedImage(data.logo, 200, 75)} alt={data.title} className={"w-[200px] h-[75px] object-contain md:object-left"} />
                            </Box>
                        }
                        {!data.logo &&
                            <p className="text-2xl font-bold text-white shadow-2xl">
                                {data.title}
                            </p>
                        }

                        <SubSection movie={data} />
                        {data.genres &&
                            <div className="flex flex-row flex-wrap gap-2 ">
                                {data.genres.map((genre:string) => (
                                    <Chip
                                        key={genre}
                                        onClick={() =>  router.push(`/search/?genres=${genre}`)}
                                        sx={CHIP_SX}
                                        label={genre}
                                    />
                                ))}
                            </div>
                        }
                        <RatingsSection movie={data} />

                        <div className={"hidden md:flex flex-row gap-4"}>
                            <div className={" flex flex-col"}>
                                <p className="text-sm text-white font-semibold shadow-2xl">
                                    {data.director}
                                </p>
                                <span className="text-sm text-gray-400"> Director</span>
                            </div>

                            <div className={" flex flex-col"}>
                                <p className="text-sm text-white font-semibold shadow-2xl">
                                    {data.production}
                                </p>
                                <span className="text-sm text-gray-400"> Production</span>
                            </div>
                        </div>

                        <p className="max-w-prose text-sm leading-relaxed text-white/90">
                            {data.plot}
                        </p>


                        <div className="flex flex-row gap-2 ">
                            <Cart id={data.id} />
                            <Favorite id={data.id} title={data.title} />
                            <Rate id={data.id} />
                            <Share  id={data.id} />
                        </div>
                    </div>
                </div>



               <div
                    className="flex flex-row gap-1 justify-center w-full h-full "
                >
                    <div
                        className="relative flex flex-col gap-1 w-full h-full overflow-y-hidden"
                    >
                        <ScrollableContainer data={data.cast} title={"Cast & Crew"} ItemComponent={CastItem} />

                        <InfiniteScrollableContainer title={"Critic Reviews"} url={CRITIC_REVIEW_URL + data.movieId} ItemComponent={CriticReviewItem} />
                        <InfiniteScrollableContainer title={'User Reviews'} token={auth.user?.idToken} url={USER_REVIEW_URL + data.id} ItemComponent={UserReviewItem} />
                        <InfiniteScrollableContainer title={"Related"} url={SUGGESTION_URL + data.movieId + "?sortBy=rating"} ItemComponent={RelatedPoster} />

                        <div className={'h-[1px] bg-gray-600 mt-2 mb-2'}/>
                        <div className={"flex flex-col gap-2 w-full  "}>
                            <p className="text-lg font-bold text-gray-300">Information</p>

                            {/* A real grid, so every item sits in an even column
                                (value above label, like the details up top); the
                                long awards line gets a full row of its own. */}
                            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                                {infoItems(data).map(({label, values, wide}) => (
                                    <div key={label} className={`flex min-w-0 flex-col-reverse gap-1 ${wide ? 'col-span-full' : ''}`}>
                                        <dt className="text-sm text-gray-400">{label}</dt>
                                        <dd className="flex flex-col text-sm font-semibold text-gray-200">
                                            {values.map((value) => <span key={value}>{value}</span>)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            <div className={"flex flex-col gap-2 w-full "}>
                                <p className="text-lg font-bold text-gray-300">Keywords</p>
                                {data.tags &&
                                    <div className="flex flex-wrap gap-2">
                                        {data.tags.map((tag:Tag, index: number) => (
                                            <div key={index}>
                                                <Chip
                                                    className={'text-sm font-semibold bg-gray-900'}
                                                    onClick={() =>  router.push(`/search/?tags=${tag.tag_id}`)}
                                                    sx={{
                                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                                        color: 'white',
                                                        "&:hover": {
                                                            backgroundColor: "rgba(100,100,100,0.4)",
                                                        },
                                                        cursor: 'pointer',
                                                    }}
                                                    label={tag.name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}