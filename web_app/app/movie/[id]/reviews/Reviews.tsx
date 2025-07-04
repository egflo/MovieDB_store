'use client';

import useSWR from "swr";
import {Movie} from "@/lib/models/Movie";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import PosterImage from "@/app/components/PosterImage";
import {useSearchParams} from "next/navigation";
import {Review} from "@/lib/models/Review";
import ProfileImage from "@/app/components/ProfileImage";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import {Favorite, ThumbDown, ThumbUp} from "@mui/icons-material";
import CommentIcon from '@mui/icons-material/Comment';
import {useAuth} from "@/lib/firebase/AuthContext";
import {SentimentState} from "@/lib/models/SentimentState";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CHARACTER_LIMIT = 500;
const SENTIMENT_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/sentiment/rate`;

function ResultItem({item}: { item: Review }) {
    const router = useRouter();
    const auth = useAuth();
    const [sentiment, setSentiment] = useState<SentimentState>(item.sentiment ? item.sentiment.status : SentimentState.NONE);
    const [likeCount, setLikeCount] = useState<number>(item.likes);
    const [dislikeCount, setDislikeCount] = useState<number>(item.dislikes);
    const [selected, setSelected] = useState(false);
    const [showMore, setShowMore] = useState(false);

    function handleSentimentChange(state: SentimentState) {
        switch (state) {
            case SentimentState.LIKE:
                // Check if the user is already liked
                if (state === sentiment) {
                    setSentiment(SentimentState.NONE);
                    setLikeCount((prev) => prev - 1);
                }
                else if (sentiment === SentimentState.DISLIKE) {
                    setSentiment(SentimentState.LIKE);
                    setLikeCount((prev) => prev + 1);
                    setDislikeCount((prev) => prev - 1);
                }
                else  {
                    setSentiment(SentimentState.LIKE);
                    setLikeCount((prev) => prev + 1);
                }
                break;
            case SentimentState.DISLIKE:
                if (state === sentiment) {
                    setSentiment(SentimentState.NONE);
                    setDislikeCount((prev) => prev - 1);
                }
                else if (sentiment === SentimentState.LIKE) {
                    setSentiment(SentimentState.DISLIKE);
                    setDislikeCount((prev) => prev + 1);
                    setLikeCount((prev) => prev - 1);
                }
                else {
                    setSentiment(SentimentState.DISLIKE);
                    setDislikeCount((prev) => prev + 1);
                }
                break;
            case SentimentState.NONE:
                setSentiment(SentimentState.NONE);
                break;
        }

        handleSentiment(state);
    }

    async function handleSentiment(sentiment: SentimentState) {
        if (!auth.user) {
            router.push('/login');
            return;
        }

        const response = await fetch(SENTIMENT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user?.idToken}`,
            },
            body: JSON.stringify({
                userId: auth.user?.uid,
                objectId: item.id,
                created: new Date().getDate(),
                status: sentiment
            }),
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.error('Error:', response.statusText);
        }
    }

    const onCommentClick = () => {
        const encodedReview = encodeURIComponent(JSON.stringify(item));
        router.push(`/movie/${item.movie.movieId}/reviews/review?data=${encodedReview}`);
    }

    function ScoreToStar(score: number) {
        // Convert score to star rating with 5 stars and half-stars
        let stars = [];
        let fullStars = Math.floor(score / 2);
        let halfStars = score % 2;
        let emptyStars = 5 - fullStars - halfStars;
        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarIcon key={i} fontSize={'small'} sx={{color: 'yellow'}}/>);
        }
        for (let i = 0; i < halfStars; i++) {
            stars.push(<StarHalfIcon key={i + fullStars} fontSize={'small'} sx={{color: 'yellow'}}/>);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<StarIcon key={i + fullStars + halfStars} fontSize={'small'} sx={{color: 'gray'}}/>);
        }
        return stars;
    }

    return (
        <div className={'relative w-full h-auto flex flex-col  isolate   rounded-xl bg-gray-400/20 shadow-lg ring-1 ring-black/5 overflow-hidden'}>

            <div
                className={'absolute top-0 left-0 w-full h-full opacity-45'}
                style={
                    {
                        width: '100%',
                        height: '100%',
                        backgroundSize: 'cover',
                        backgroundImage: `url(${item.movie.poster})`,
                    }
                }>
            </div>

            <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-black to-transparent" />


            <div className={"z-10 p-4"} >
                <div
                    className={"grid md:grid-cols-[60px_auto_200px] gap-2 "}
                >
                    <ProfileImage name={item.user.displayName} imageUrl={item.user.profileImage} size={50} className={"hidden md:block"} />

                    <div className="flex flex-col gap-1 justify-start ">

                        <div className={"flex flex-col gap-1 justify-start "}>
                            <h1 className="text-md font-bold text-white">
                                {item.title}
                            </h1>
                            <span className={'text-sm   text-gray-300  '}>
                        By {item.user.displayName} on {new Date(item.date).toLocaleDateString()}
                    </span>
                            <div className={'flex flex-row gap-0 md:hidden'}>
                                {ScoreToStar(item.rating)}
                                {item.love &&
                                    <div className={'flex gap-0 items-center '}>
                                        <Favorite fontSize={'small'} sx={{color: 'red'}}/>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="text-sm text-white">
                            {item.content.length > CHARACTER_LIMIT ? (
                                <>
                                    {!showMore ? `${item.content.slice(0, CHARACTER_LIMIT)}...` : item.content}
                                    <button
                                        onClick={() => setShowMore(!showMore)}
                                        className="text-blue-400 hover:text-blue-500 ml-1"
                                    >
                                        {showMore ? 'Show Less' : 'Read More'}
                                    </button>
                                </>
                            ) : item.content}
                        </div>
                    </div>

                    <div className={"hidden md:flex flex-col gap-1  items-center h-full"}>
                        <div className={"flex flex-col gap-1 items-center justify-center "}>
                            <PosterImage name={item.movie.title} imageUrl={item.movie.poster} width={120} height={140} className={"rounded-lg"} />
                            <p className={"text-sm font-semibold text-gray-300"}>{item.movie.title}</p>
                        </div>

                        <div className={'flex flex-row gap-0'}>
                            {ScoreToStar(item.rating)}
                            {item.love &&
                                <div className={'flex gap-0 items-center '}>
                                    <Favorite fontSize={'small'} sx={{color: 'red'}}/>
                                </div>
                            }
                        </div>
                    </div>

                </div>

                <div className={ 'flex flex-row gap-4 items-center'}>
                    <div className={'flex flex-row gap-1 items-center'}>
                        <ThumbUp
                            fontSize={'small'}
                            sx={{color: sentiment === SentimentState.LIKE ? 'white' : 'gray', cursor: 'pointer'}}
                            onClick={() => {
                                handleSentimentChange(SentimentState.LIKE);
                            }}
                        />
                        <p className={'text-sm text-gray-500'}>
                            {likeCount}
                        </p>
                    </div>

                    <div className={'flex flex-row gap-1 items-center'}>
                        <ThumbDown
                            fontSize={'small'}
                            sx={{color: sentiment === SentimentState.DISLIKE ? 'white' : 'gray', cursor: 'pointer'}}
                            onClick={() => {
                                handleSentimentChange(SentimentState.DISLIKE);
                            }}
                        />
                        <p className={'text-sm text-gray-500'}>
                            {dislikeCount}
                        </p>
                    </div>

                    <div className={'flex flex-row '}>
                        <button
                            onClick={onCommentClick}
                            className=" text-white  rounded-lg flex items-center gap-1"
                        >
                            <CommentIcon fontSize={'small'} sx={{color: 'white'}}/>
                            <span className={'ml-1'}>
                             0
                        </span>
                        </button>
                    </div>
                </div>
            </div>




        </div>
    )
}

interface ResultsProps {
    query: string;
    page: number;
    sort: string;
    limit: number;
}


const SEARCH_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/review/movie`;
const SEARCH_URL_WITH_QUERY = (query: string, page: number, sort: string, limit: number) => {
    return `${SEARCH_URL}/${query}?page=${page}&sort=${sort}&limit=${limit}`;
}

function Results({query, page, sort, limit}: ResultsProps) {
    const URL = SEARCH_URL_WITH_QUERY(query, page, sort, limit);
    const { data, error } = useSWR(URL, fetcher);

    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>

    return (
        <div className={"flex flex-col gap-2 mt-4"}>
            {data.content.map((result: any) => (
                <div key={result.id}>
                    <ResultItem item={result} />
                </div>
            ))}
        </div>
    )
}

export default function Reviews({id}: { id: string }) {
    const router= useRouter();
    const searchParams = useSearchParams();
    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
    const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
    const [sort, setSort] = useState(searchParams.get("sort") || "relevance");

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = event.target.value;
        setSort(newSort);
        router.push(`/movie/${id}/reviews?page=${page}&sort=${newSort}&limit=${limit}`);
    }

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = event.target.value;
        setLimit(newLimit);
        router.push(`/movie/${id}/reviews?page=${page}&sort=${newLimit}&limit=${limit}`);
    }

    return (

    <div className={"flex flex-col items-center justify-center p-4"}>
        <div className={"w-full  flex flex-row  justify-between mt-4"}>
            <div className={"flex flex-row gap-2"}>
                <select
                    value={sort}
                    onChange={handleSortChange}
                    className="bg-gray-800 text-white p-2 rounded-lg"
                >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                    <option value="created">Year</option>
                </select>

                <select
                    value={limit}
                    onChange={handleLimitChange}
                    className="bg-gray-800 text-white p-2 rounded-lg"
                >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>


            <div className="flex flex-row gap-2">
                <button
                    onClick={() => setPage(Number(page) - 1)}
                    disabled={Number(page) <= 1}
                    className="bg-gray-800 text-white p-2 rounded-lg"
                >
                    Previous
                </button>
                <button
                    onClick={() => setPage(Number(page) + 1)}
                    className="bg-gray-800 text-white p-2 rounded-lg"
                >
                    Next
                </button>
            </div>
        </div>

        <div className={"flex flex-col gap-2 mt-4"}>
            <h1 className="text-3xl font-bold text-white">Reviews</h1>
            <Results query={id} page={page} sort={sort} limit={limit} />
        </div>


        <div className="flex flex-row gap-2 mt-4">
            {page > 1 && (
                <button
                    onClick={() => setPage(Number(page) - 1)}
                    disabled={page <= 1}
                    className="bg-gray-800 text-white p-2 rounded-lg"
                >
                    Previous
                </button>
            )}

            <button
                onClick={() => setPage(Number(page) + 1)}
                className="bg-gray-800 text-white p-2 rounded-lg"
            >
                Next
            </button>
        </div>
    </div>
    )

}