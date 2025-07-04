'use client';

import React, {useState} from "react";
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import {Review} from "@/lib/models/Review";
import {Favorite, ThumbDown, ThumbUp} from "@mui/icons-material";
import ProfileImage from "@/app/components/ProfileImage";
import {SentimentState} from "@/lib/models/SentimentState";
import {useRouter} from "next/navigation";
import {useAuth} from "@/lib/firebase/AuthContext";

interface  UserReviewProps {
    item: Review
}

const SENTIMENT_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/sentiment/rate`;
const  fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserReviewItem({ item }: UserReviewProps) {
    const review = item;

    const auth = useAuth();
    const router = useRouter();
    const [sentiment, setSentiment] = useState<SentimentState>(review.sentiment ? review.sentiment.status : SentimentState.NONE);
    const [likeCount, setLikeCount] = useState<number>(review.likes);
    const [dislikeCount, setDislikeCount] = useState<number>(review.dislikes);
    const [selected, setSelected] = useState(false);

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
                objectId: review.id,
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

    function formatDateString(date: string) {
        let d = new Date(date);
        //Ex Aug 9, 2021
        return d.toLocaleString('default', { month: 'short' }) + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    function ScoreToStar(score: number) {
        // Convert score to star rating with 5 stars and half stars
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
        <div className=" w-[300px] h-[280px] isolate aspect-video  rounded-xl bg-gray-400/20 shadow-lg ring-1 ring-black/5">
            <div className={'flex flex-col gap-1  rounded-lg p-4 h-full w-full  '}>

                <div className={'flex flex-row gap-2 items-center'}>
                    <ProfileImage
                        name={review.user.displayName}
                        imageUrl={review.user.displayName}
                        size={30}
                    />
                    <p className={'text-sm font-semibold'}>
                        {review.user.displayName}
                    </p>
                </div>

                <div className={'flex flex-col gap-1'}>
                    <p className={'text-sm font-semibold'}
                       style={{
                           textWrap: 'wrap',
                           textOverflow: 'ellipsis',
                           overflow: 'hidden',
                           width: '100%',
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical',
                       }}
                    >
                        {review.title}
                    </p>
                </div>

                <div className={'flex flex-row gap-0'}>
                    {ScoreToStar(review.rating)}
                    {review.love &&
                        <div className={'flex gap-0 items-center ml-2'}>
                            <Favorite fontSize={'small'} sx={{color: 'red'}}/>
                        </div>
                    }
                </div>

                <div
                    onClick={() => setSelected(!selected)}
                    className={'flex h-full flex-col gap-1'}>
                    <p className={'text-sm text-gray-300 '}
                       style={{
                           textWrap: 'wrap',
                           textOverflow: 'ellipsis',
                           overflow: 'hidden',
                           width: '100%',
                           display: '-webkit-box',
                           WebkitLineClamp: 5,
                           WebkitBoxOrient: 'vertical',
                       }}
                    >
                        {review.content}
                    </p>
                </div>


                <div className={'flex flex-row  items-center justify-between'}>
                    <p className={'text-sm text-gray-500'}>
                        {formatDateString(review.date)}
                    </p>

                    <div className={'flex flex-row gap-2 items-center'}>
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

                    </div>
                </div>
            </div>
        </div>
    )

}