import React, {DependencyList, EffectCallback, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {CriticReview} from "@/lib/models/CriticReview";
import StarIcon from '@mui/icons-material/Star';
import {GLASS_CARD} from "@/app/ui/glass";

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
        // overflow-hidden so nothing can spill onto the next card in the row.
        <div className={`w-[300px] h-[200px] isolate overflow-hidden rounded-xl ${GLASS_CARD}`}>

            <div className={'flex flex-col   p-4 '}>

                <div className="flex flex-row gap-2">
                    <div className={'flex shrink-0 flex-col gap-0 items-center'}>
                        <img className="content__rating" style={{height: 25}}
                             src={"/rotten_tomatoes/" + review.review_state + ".png"} alt={"tomato"}></img>
                        <p className={'mt-1 text-sm font-semibold'}>
                            {review.score}
                        </p>
                    </div>

                    {/* Takes the leftover width and truncates, so a long
                        publication name can't push the Top Critic badge past
                        the card's edge. */}
                    <div className={'flex min-w-0 flex-1 flex-col gap-0'}>
                        <p className={'truncate text-sm font-semibold'} title={review.critic_name}>
                            {review.critic_name}
                        </p>
                        <p className={'truncate text-sm text-white/55'} title={review.publication_name}>
                            {review.publication_name}
                        </p>
                    </div>

                    <div className={'flex shrink-0 flex-col items-center gap-0'}>
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

                <div
                    className={'flex h-[100px] flex-col gap-1 p-2 overflow-hidden'}>
                    <p className={'text-sm text-gray-300 '}
                       style={{
                           textWrap: 'wrap',
                           textOverflow: 'ellipsis',
                           overflow: 'hidden',
                           width: '100%',
                           display: '-webkit-box',
                           WebkitLineClamp: 4,
                           WebkitBoxOrient: 'vertical',
                       }}
                    >
                        {review.text}
                    </p>
                </div>

                <div className={'flex flex-row justify-between items-center'}>
                    <p className={'text-sm text-white/55'}>
                        {formatDateString(review.creation_date)}
                    </p>
                    <Link href={review.review_url} target="_blank" className={'text-blue-500 hover:underline'}>
                        <p className={'text-sm'}>
                            Full Review
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )

}