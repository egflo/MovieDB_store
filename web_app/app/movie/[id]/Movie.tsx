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


const CRITIC_REVIEW_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/critic/movie/`;
const USER_REVIEW_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/review/movie/`;
const SUGGESTION_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/suggest/`;


const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Movie({id}: { id: string }) {

    const auth = useAuth();
    const router = useRouter();

    const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/${id}`;
    const { data, error } = useSWR(URL, fetcher);

    const testURL = (url: string) => {
        return url && url.startsWith("http") && (url.endsWith(".jpg") || url.endsWith(".png") || url.endsWith(".jpeg"));
    }

    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>

    return (
        <div className={"flex flex-col  w-full   "}>
            <div className={'w-screen h-[70vh] opacity-45 blur relative'}>
                <div
                    style={
                        {
                            width: '100%',
                            height: '100%',
                            backgroundSize: 'cover',
                            backgroundImage: `url(${testURL(data.background) ? data.background : data.poster})`,
                        }
                    }>
                </div>
                <div className="absolute bottom-0 w-full h-full  bg-gradient-to-t from-black to-transparent" />
            </div>

            <div className={'absolute top-0 left-0 w-full h-full flex flex-col align-top  p-4 gap-4'}>

                <div className="flex flex-col items-center md:flex-row gap-4 justify-center w-full h-full">

                    <PosterImage  name={data.title} imageUrl={data.poster} width={220} height={310} className={"rounded-lg"} />

                    <div className="flex flex-col items-center md:items-start gap-1 ">

                        {data.logo &&
                            <Box className={"flex justify-center items-center p-0 m-0  rounded-lg"}>
                                <img src={data.logo} alt={data.title} className={"w-[200px] h-[75px] object-contain"} />
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

                        <div className="text-sm text-white font-semibold shadow-2xl">
                            {data.plot}
                        </div>

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

                        <InfiniteScrollableContainer title={"Critic Reviews"} url={CRITIC_REVIEW_URL + data.movieId + "?"} ItemComponent={CriticReviewItem} />
                        <InfiniteScrollableContainer title={'User Reviews'} token={auth.user?.idToken} url={USER_REVIEW_URL + data.id} ItemComponent={UserReviewItem} />
                        <InfiniteScrollableContainer title={"Related"} url={SUGGESTION_URL + data.movieId + "?sortBy=rating"} ItemComponent={PosterItem} size={"small"} />

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
                                            {data.writer.split(",").map((writer: string, index: number) => (
                                                <p key={index} className="text-sm text-gray-300 font-semibold ">
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

                                {data.release_date &&
                                    <div className={"flex flex-col gap-1"}>
                                        <p className="text-sm text-gray-300 font-semibold ">
                                            {data.release_date}
                                        </p>
                                        <span className="text-sm text-gray-400"> Release date</span>
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