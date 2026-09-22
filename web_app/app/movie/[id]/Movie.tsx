"use client"
import useSWR from 'swr';
import RatingsSection from "@/app/ui/RatingsSection";
import InfiniteScrollableContainer from "@/app/components/InfiniteScrollableContainer";
import ScrollableContainer from "@/app/components/ScrollableContainer";
import CastItem from "@/app/ui/CastItem";
import CriticReviewItem from "@/app/ui/CriticReviewItem";
import UserReviewItem from "@/app/ui/UserReviewItem";
import {Chip} from "@mui/material";
import PosterItem from "@/app/ui/PosterItem";
import Cart from "@/app/components/actions/Cart";
import Favorite from "@/app/components/actions/Favorite";
import Rate from "@/app/components/actions/Rate";
import Share from "@/app/components/actions/Share";
import {Tag} from "@/lib/models/Tag";
import Box from "@mui/material/Box";
import PosterImage from "@/app/components/PosterImage";
import SubSection from "@/app/ui/SubSection";
import {useAuth} from "@/lib/firebase/AuthContext";
import React from "react";
import {useRouter} from "next/navigation";
import ScrollZoomBackdrop from "@/app/components/ScrollZoomBackdrop";
import {optimizedImage} from "@/lib/image";


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

/** Placeholder in the shape of the page while the movie loads. */
function MovieSkeleton() {
    return (
        <div role="status" aria-label="Loading movie" className="flex w-full flex-col gap-8 p-4 pt-8 motion-safe:animate-pulse">
            <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row">
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

export default function Movie({id}: { id: string }) {

    const auth = useAuth();
    const router = useRouter();

    const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/${id}`;
    const { data, error } = useSWR(URL, fetcher);

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
            <div className={'flex flex-col w-full p-4 pt-8 gap-4'}>

                <div className="flex flex-col items-center md:flex-row gap-4 justify-center w-full h-full">

                    <PosterImage  name={data.title} imageUrl={data.poster} width={220} height={310} className={"rounded-lg"} />

                    <div className="flex flex-col items-center md:items-start gap-1 ">

                        {data.logo &&
                            <Box className={"flex justify-center items-center p-0 m-0  rounded-lg"}>
                                {/* Through the optimizer: fanart.tv logos are full-size
                                    PNGs, often http:// URLs that redirect. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img {...optimizedImage(data.logo, 200, 75)} alt={data.title} className={"w-[200px] h-[75px] object-contain"} />
                            </Box>
                        }
                        {!data.logo &&
                            <p className="text-2xl font-bold text-white shadow-2xl">
                                {data.title}
                            </p>
                        }

                        <SubSection movie={data} />
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

                        {data.genres &&
                            <div className="flex flex-row gap-2 ">
                                {data.genres.map((genre:string, index: number) => (
                                    <div key={index}>
                                        <Chip
                                            className={'text-sm font-semibold bg-gray-900'}
                                            onClick={() =>  router.push(`/search/?genres=${genre}`)}
                                            sx={{
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                "&:hover": {
                                                    backgroundColor: "rgba(100,100,100,0.4)",
                                                },
                                                cursor: 'pointer',
                                            }}
                                            label={genre}
                                        />
                                    </div>
                                ))}
                            </div>
                        }

                        <div className="flex flex-row gap-2 ">
                            <Cart id={data.id} />
                            <Favorite id={data.id} />
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
                        <InfiniteScrollableContainer title={"Related"} url={SUGGESTION_URL + data.movieId + "?sortBy=rating"} ItemComponent={PosterItem} />

                        <div className={'h-[1px] bg-gray-600 mt-2 mb-2'}/>
                        <div className={"flex flex-col gap-2 w-full  "}>
                            <p className="text-lg font-bold text-gray-300">Information</p>

                            <div className={"information-container flex flex-wrap gap-6"}>
                                {data.director &&
                                    <div className={"flex flex-col gap-1"}>
                                        <p className="text-sm text-gray-300 font-semibold ">
                                            {data.director}
                                        </p>
                                        <span className="text-sm text-gray-400"> Director</span>
                                    </div>
                                }

                                {data.writer &&
                                    <div className={"flex flex-col gap-1"}>
                                        <div className={"flex flex-col gap-1 max-w-[200px] w-[200px] "}>
                                            {uniqueNames(data.writer).map((writer: string) => (
                                                <p key={writer} className="text-sm text-gray-300 font-semibold ">
                                                    {writer}
                                                </p>
                                            ))}

                                        </div>

                                        <span className="text-sm text-gray-400"> Writer(s)</span>
                                    </div>
                                }

                                {data.language &&
                                    <div className={"flex flex-col gap-1"}>
                                        <p className="text-sm text-gray-300 font-semibold ">
                                            {data.language}
                                        </p>
                                        <span className="text-sm text-gray-400"> Language</span>
                                    </div>
                                }

                                {data.production &&
                                    <div className={"flex flex-col gap-1"}>
                                        <p className="text-sm text-gray-300 font-semibold ">
                                            {data.production}
                                        </p>
                                        <span className="text-sm text-gray-400"> Production</span>
                                    </div>
                                }

                                {data.country &&
                                    <div className={"flex flex-col gap-1"}>
                                        <p className="text-sm text-gray-300 font-semibold ">
                                            {data.country}
                                        </p>
                                        <span className="text-sm text-gray-400"> Country</span>
                                    </div>
                                }

                                {data.awards &&
                                    <div className={"flex flex-col gap-1"}>
                                        <p className="text-sm text-gray-300 font-semibold ">
                                            {data.awards}
                                        </p>
                                        <span className="text-sm text-gray-400"> Awards</span>
                                    </div>
                                }

                                {data.boxOffice &&
                                    <div className={"flex flex-col gap-1"}>
                                        <p className="text-sm text-gray-300 font-semibold ">
                                            {data.boxOffice}
                                        </p>
                                        <span className="text-sm text-gray-400"> Box office</span>
                                    </div>
                                }


                                {data.runtime &&
                                    <div className={"flex flex-col gap-1"}>
                                        <p className="text-sm text-gray-300 font-semibold ">
                                            {data.runtime} min
                                        </p>
                                        <span className="text-sm text-gray-400"> Runtime</span>
                                    </div>
                                }

                            </div>

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