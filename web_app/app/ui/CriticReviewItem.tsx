import React, {DependencyList, EffectCallback, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {CriticReview} from "@/app/models/CriticReview";
import StarIcon from '@mui/icons-material/Star';

interface  CriticReviewProps {
    item: CriticReview
}

export default function CriticReviewItem({ item }: CriticReviewProps) {
    const review = item;
    const [selected, setSelected] = useState(false);
    function formatDateString(date: string) {
        let d = new Date(date);
        //Ex Aug 9, 2021
        return d.toLocaleString('default', { month: 'short' }) + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    return (
        <div className={'flex flex-col gap-1 bg-gray-800 rounded-lg p-4 shadow-md w-[300px] h-[250px]'}>

            <div className="flex flex-row gap-2">
                <div className={'flex flex-col gap-0 items-center'}>
                    <img className="content__rating" style={{height: 25}}
                         src={"/rotten_tomatoes/" + review.review_state + ".png"} alt={"tomato"}></img>
                    <p className={'mt-1 text-sm font-semibold'}>
                        {review.score}
                    </p>
                </div>

                <div className={'flex flex-col gap-0'}>
                    <p className={'text-sm font-semibold'}>
                        {review.critic_name}
                    </p>
                    <p className={'text-sm text-gray-500'}>
                        {review.publication_name}
                    </p>
                </div>

                <div className={'flex flex-col items-center gap-0'}>
                    {review.isTopCritic &&
                        <div className={'flex gap-0 items-center'}>
                            <StarIcon fontSize={'small'} sx={{color: 'red'}}/>
                            <p className={'text-sm font-semibold text-red-500'}>
                                Top Critic
                            </p>
                        </div>
                    }
                </div>
            </div>

            <p className={'text-sm text-gray-300 h-full'}
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
                {review.text}
            </p>

            <div className={'h-[1px] bg-gray-600 mt-2 mb-2'}/>

            <div className={'flex flex-row justify-between items-center'}>
                <p className={'text-sm text-gray-500'}>
                    {formatDateString(review.creation_date)}
                </p>
                <Link href={review.review_url} target="_blank" className={'text-blue-500 hover:underline'}>
                    <p className={'text-sm'}>
                        Full Review
                    </p>
                </Link>
            </div>
        </div>
    )

}