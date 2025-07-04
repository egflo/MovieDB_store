'use client';

import {useRouter, useSearchParams} from "next/navigation";
import React, { useEffect, useState } from "react";
import PosterImage from "@/app/components/PosterImage";
import ProfileImage from "@/app/components/ProfileImage";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarIcon from "@mui/icons-material/Star";
import { Favorite } from "@mui/icons-material";
import useSWR from "swr";
import {Comment} from "@/lib/models/Comment";
import {User} from "@firebase/auth";
import {useAuth} from "@/lib/firebase/AuthContext";
import IconButton from "@mui/material/IconButton";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const SEARCH_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/comments/review`;
const SEARCH_URL_WITH_QUERY = (query: string, page: number, sort: string, limit: number) => {
    return `${SEARCH_URL}/${query}?page=${page}&sort=${sort}&limit=${limit}`;
}


function Reply({id}: {id: string}) {
    const auth = useAuth();
    const [reply, setReply] = useState<string>("");

    function handleReply() {
        console.log(reply);
        if (reply.length > 0) {
            setReply("");
        }
    }


    // @ts-ignore
    return (
        <div className={"flex flex-row gap-2 items-center w-full "}>
            <ProfileImage name={auth.user?.displayName} imageUrl={auth.user?.photoURL} size={40} className={"rounded-full"} />

            <input type="text" value={reply} onChange={(e) => setReply(e.target.value)} placeholder={"Reply..."} className={"bg-gray-800 text-white rounded-lg p-2 w-full"} />

            <button onClick={handleReply} className={"bg-blue-500 text-white rounded-lg font-semibold p-2"}>
                Reply
            </button>
        </div>
    );

}

function CommentItem({ comment }: { comment: Comment }) {
    const [like, setLike] = useState<boolean>(false);

    function handleLike() {
        setLike(!like)
        comment.likes = comment.likes + 1
    }

    function formatDate(date: Date) {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    return (
        <div className={"grid grid-cols-[60px_auto_50px] items-center"}>
            <div className={"flex items-start justify-center h-full"}>
                <ProfileImage name={comment.user.displayName} imageUrl={comment.user.profileImage} size={40} className={"rounded-full"} />
            </div>

            <div className={"flex flex-col gap-1"}>
                <span className={"text-sm text-gray-300 font-bold"}>{comment.user.displayName} &#x2022; {formatDate(comment.date)}</span>

                <p className={"text-sm font-semibold"}>{comment.text}</p>
            </div>

            <div className={"flex flex-col align-middle items-center"}>
                <IconButton
                    onClick={() => {handleLike()}}
                    className={"bg-gray-800 hover:bg-gray-700 rounded-full p-1"}
                    size={"small"}
                >
                    <div className={"flex flex-col gap-0 items-center"}>
                        <FavoriteBorderOutlined fontSize={"large"} sx={{ color: like ? 'red' : 'gray' }} />
                        <span className={"text-sm text-gray-300 font-semibold"}>{comment.likes}</span>
                    </div>
                </IconButton>
            </div>

        </div>
    );

}

export default function Review() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const review = JSON.parse(decodeURIComponent(searchParams.get('data') || '{}'));

    const { data, error } = useSWR(SEARCH_URL_WITH_QUERY(review.id, 1, 'date', 10), fetcher);

    if(error) return <div>Failed to load</div>
    if(!data) return <div>Loading...</div>

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

    function formatDate(date: string) {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    return (
        <div className={"flex flex-col items-center justify-center p-4 gap-4 "}>

            <div className={"sm:flex flex-col  md:grid grid-cols-[auto_185px] bg-gray-800 rounded-lg"}>
                <div className={"flex flex-col gap-1 p-5"}>
                    <div className={"flex flex-row gap-2 items-center"}>
                        <ProfileImage name={review.user.displayName} imageUrl={review.user.profile} size={40} className={"rounded-full"} />
                        <span className={"text-sm text-gray-300  font-bold"}>{review.user.displayName}</span>
                    </div>

                    <p className={"text-md font-bold"}>{review.title}</p>

                    <div className={'flex flex-row gap-0 '}>
                        {ScoreToStar(review.rating)}
                        {review.love &&
                            <div className={'flex gap-0 items-center ml-2'}>
                                <Favorite fontSize={'small'} sx={{color: 'red'}}/>
                            </div>
                        }

                    </div>

                    <div className={"flex flex-col gap-4 mt-2"}>
                        <p className={"text-sm font-semibold"}>{review.content}</p>

                        <span className={"text-sm text-gray-300 font-bold"}>Reviewed on {formatDate(review.date)}</span>
                    </div>
                </div>


                <div className={"hidden md:flex flex-col gap-1  items-center justify-center "}>
                    <PosterImage name={review.movie.title} imageUrl={review.movie.poster} width={160} height={200} className={"rounded-lg"} />
                    <p className={"text-sm font-semibold text-gray-300"}>{review.movie.title}</p>
                </div>
            </div>


            <div className={"flex flex-col gap-2  w-full"}>
                <h1 className={"text-lg font-bold text-gray-300"}>Comments</h1>

                <Reply id={review.id} />

                <div className={"flex flex-col gap-2"}>
                    {data.map((comment: Comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            </div>
        </div>
    );
}