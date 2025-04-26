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
import {Tag} from "@/app/models/Tag";
import Box from "@mui/material/Box";


const CRITIC_REVIEW_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/critic/movie/`;
const USER_REVIEW_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/review/movie/`;
const SUGGESTION_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/suggest/`;


const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Movie({id}: { id: string }) {

    const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/${id}`;
    const { data, error } = useSWR(URL, fetcher);

    const testURL = (url: string) => {
        return url.startsWith('http') || url.startsWith('https');
    }

    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>

    return (
        <div className={""}>
            <div className={'w-screen h-[60vh] opacity-45 blur relative'}>
                <div
                    style={
                        {
                            width: '100%',
                            height: '100%',
                            backgroundSize: 'cover',
                            backgroundImage: `url(${testURL(data.background) ? data.background : "/background.png"})`,
                        }
                    }>
                </div>
                <div className="absolute bottom-0 w-full h-full  bg-gradient-to-t from-black to-transparent" />
            </div>

            <div className={'absolute top-0 left-0 w-full h-full flex flex-col items-center rounded-lg p-4 gap-4'}>
                <div className=" flex flex-row gap-2 justify-center ">
                    <img
                        className="w-[200px] h-[300px] object-cover rounded-lg  "
                        src={testURL(data.poster) ? data.poster : "/poster.png"}
                        alt="Movie Poster"
                    />

                    <div className="flex flex-col gap-2 mt-4">
                        <h1 className="text-3xl font-bold text-white">{data.title}</h1>

                        <p className="text-md text-white">
                            {data.year && <span>{data.year} &#x2022; </span>}
                            {data.rated && <span>{data.rated} &#x2022; </span>}
                            {data.runtime && <span>{data.runtime} min </span>}

                        </p>

                        <RatingsSection movie={data} />

                        <div className="text-md text-white">
                            {data.plot}
                        </div>

                        {data.genres &&
                            <div className="flex flex-row gap-2 mt-2">
                                {data.genres.map((genre:string, index: number) => (
                                    <div key={index}>
                                        <Chip
                                            className={'text-sm font-semibold bg-gray-900'}
                                            onClick={() =>  console.log(genre)}
                                            sx={{
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                "&:hover": {
                                                    backgroundColor: "rgba(190,100,100,0.4)",
                                                },
                                                cursor: 'pointer',
                                            }}
                                            label={genre}
                                        />
                                    </div>
                                ))}
                            </div>
                        }



                        <div className="flex flex-row gap-2 mt-2">
                            <Cart id={data.id} />
                            <Favorite id={data.id} />
                            <Rate id={data.id} />
                            <Share  id={data.id} />
                        </div>


                    </div>
                </div>

                <ScrollableContainer data={data.cast} ItemComponent={CastItem} />

               <div
                    className="flex flex-row gap-2 justify-center w-full h-full"
                >
                    <div
                        className="relative flex flex-col gap-2 w-full h-full overflow-y-hidden"
                    >
                        <div className="absolute -inset-1 rounded-md blur-md bg-gradient-to-br from-pink-500 via-cyan-500 to-violet-500 "></div>


                        <InfiniteScrollableContainer url={CRITIC_REVIEW_URL + data.movieId + "?"} ItemComponent={CriticReviewItem} />
                        <InfiniteScrollableContainer url={USER_REVIEW_URL + data.id} ItemComponent={UserReviewItem} />
                        <InfiniteScrollableContainer url={SUGGESTION_URL + data.movieId + "?sortBy=rating"} ItemComponent={PosterItem} size={"small"} />



                    </div>


                    <div
                        className="relative flex flex-col gap-2 w-[300px] h-full overflow-hidden "
                    >

                        {data.tags &&
                            <div className="flex flex-wrap gap-2">
                                {data.tags.map((tag:Tag, index: number) => (
                                    <div key={index}>
                                        <Chip
                                            className={'text-sm font-semibold bg-gray-900'}
                                            onClick={() =>  console.log(tag)}
                                            sx={{
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                "&:hover": {
                                                    backgroundColor: "rgba(190,100,100,0.4)",
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
    )
}