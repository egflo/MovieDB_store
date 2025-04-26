import React, {DependencyList, EffectCallback, useEffect, useRef, useState} from "react";

import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import {Review} from "@/app/models/Review";
import { Favorite, ThumbDown, ThumbUp, Comment } from "@mui/icons-material";
import ProfileImage from "@/app/components/ProfileImage";
import {SentimentState} from "@/app/models/SentimentState";
import useSWR from "swr";

interface  UserReviewProps {
    item: Review
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserReviewItem({ item }: UserReviewProps) {
    const review = item;
    const [sentiment, setSentiment] = useState<string>(SentimentState.NONE);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isDisliked, setIsDisliked] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState<number>(review.likes);
    const [dislikeCount, setDislikeCount] = useState<number>(review.dislikes);
    const [selected, setSelected] = useState(false);



    useEffect(() => {
        switch (sentiment) {
            case SentimentState.LIKE:
                if (!isLiked) {
                    setIsLiked(true);
                    setIsDisliked(false);
                    setLikeCount((prev) => prev + 1);
                    if (isDisliked) setDislikeCount((prev) => prev - 1);
                }
                break;
            case SentimentState.DISLIKE:
                if (!isDisliked) {
                    setIsDisliked(true);
                    setIsLiked(false);
                    setDislikeCount((prev) => prev + 1);
                    if (isLiked) setLikeCount((prev) => prev - 1);
                }
                break;
            case SentimentState.NONE:
                if (isLiked) setLikeCount((prev) => prev - 1);
                if (isDisliked) setDislikeCount((prev) => prev - 1);
                setIsLiked(false);
                setIsDisliked(false);
                break;
        }
    }, [sentiment, isLiked, isDisliked]);

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
        <div className={'flex flex-col gap-1 bg-gray-800 rounded-lg p-4 shadow-md w-[300px] h-[300px]'}>

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

            <div className={'h-[1px] bg-gray-600 mt-2 mb-2'}/>

            <div className={'flex flex-row justify-between items-center justify-between'}>
                <p className={'text-sm text-gray-500'}>
                    {formatDateString(review.date)}
                </p>

                <div className={ 'flex flex-row gap-2 items-center'}>
                    <div className={'flex flex-row gap-1 items-center'}>
                        <ThumbUp
                            fontSize={'small'}
                            sx={{color: isLiked ? 'green' : 'gray', cursor: 'pointer'}}
                            onClick={() => {
                                setSentiment(isLiked ? SentimentState.NONE : SentimentState.LIKE);
                            }}
                        />
                        <p className={'text-sm text-gray-500'}>
                            {likeCount}
                        </p>
                    </div>

                    <div className={'flex flex-row gap-1 items-center'}>
                        <ThumbDown
                            fontSize={'small'}
                            sx={{color: isDisliked ? 'red' : 'gray', cursor: 'pointer'}}
                            onClick={() => {
                                setSentiment(isDisliked ? SentimentState.NONE : SentimentState.DISLIKE);
                            }}
                        />
                        <p className={'text-sm text-gray-500'}>
                            {dislikeCount}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )

}