'use client';

import React from "react";
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ProfileImage from "@/app/components/ProfileImage";
import {WebReview} from "@/lib/models/WebReview";
import {GLASS_CARD} from "@/app/ui/glass";
import {metacriticColour} from "@/lib/score";

//Ex Aug 9, 2021. In UTC: the dates are stored as midnight UTC, so local
// time showed the day before in the Americas.
function formatDateString(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** The excerpt: wraps inside the card and is cut off after `lines`. Each
 *  layout's count is what fits its card: one more and the last line is sliced. */
function Excerpt({text, lines, className}: { text: string | null; lines: number; className: string }) {
    return (
        // Not stretched to fill the card: a clamped box taller than its
        // lines shows a slice of the next one. The footers sit at the bottom
        // with mt-auto instead.
        <p className={`shrink-0 ${className}`}
           style={{
               textWrap: 'wrap',
               overflow: 'hidden',
               display: '-webkit-box',
               WebkitLineClamp: lines,
               WebkitBoxOrient: 'vertical',
           }}
        >
            {text}
        </p>
    );
}

/**
 * IMDb's layout: a small avatar, the username in blue linking to their
 * profile, one gold star with the rating beside it, then a larger bold title.
 */
function ImdbReview({review, name}: { review: WebReview; name: string }) {
    return (
        <>
            <div className={'flex flex-row gap-2 items-center'}>
                <ProfileImage name={name} imageUrl={review.user?.avatar ?? undefined} size={24} className={'shrink-0'} direct />
                {review.user?.profile ? (
                    <a href={review.user.profile} target="_blank" rel="noopener noreferrer"
                       className={'truncate text-sm font-semibold text-[#5799ef] hover:underline'}>
                        {name}
                    </a>
                ) : (
                    <p className={'truncate text-sm font-semibold'}>{name}</p>
                )}
                {review.rating !== null &&
                    <div aria-label={`${review.rating} out of 10`} className={'flex shrink-0 flex-row items-center gap-0.5'}>
                        <StarIcon sx={{fontSize: 16, color: '#f5c518'}}/>
                        <span className={'text-sm text-white/60'}>{review.rating}</span>
                    </div>
                }
            </div>

            {review.title && <Excerpt text={review.title} lines={2} className={'shrink-0 text-base font-bold leading-snug'} />}
            <Excerpt text={review.text} lines={6} className={'text-sm leading-relaxed text-gray-300'} />

            <div className={'mt-auto flex flex-row items-center justify-between'}>
                <p className={'text-sm text-white/55'}>{review.date ? formatDateString(review.date) : ''}</p>
                {review.url &&
                    <a href={review.url} target="_blank" rel="noopener noreferrer" className={'text-sm text-blue-500 hover:underline'}>
                        On IMDb
                    </a>
                }
            </div>
        </>
    );
}

/**
 * Letterboxd's layout: "Review by <name>", the rating as green stars (out of
 * five, with a half) and an orange heart when they liked the film, the text,
 * then the review's own likes.
 */
function LetterboxdReview({review, name}: { review: WebReview; name: string }) {
    const stars = review.rating === null ? '' : '\u2605'.repeat(Math.floor(review.rating / 2)) + (review.rating % 2 ? '\u00bd' : '');
    return (
        <>
            <div className={'flex flex-row gap-3 items-center'}>
                <ProfileImage name={name} imageUrl={review.user?.avatar ?? undefined} size={36} className={'shrink-0'} direct />
                <div className={'flex min-w-0 flex-col'}>
                    <p className={'truncate text-xs text-[#99aabb]'}>
                        Review by <span className={'text-sm font-bold text-white'}>{name}</span>
                    </p>
                    <div className={'flex flex-row items-center gap-1.5'}>
                        {review.rating !== null &&
                            <span role="img" aria-label={`${review.rating / 2} out of 5 stars`} className={'text-sm leading-none tracking-wide text-[#00e054]'}>
                                {stars}
                            </span>
                        }
                        {review.liked && <FavoriteIcon titleAccess="Liked the film" sx={{fontSize: 13, color: '#ff9010'}}/>}
                    </div>
                </div>
            </div>

            <Excerpt text={review.text} lines={7} className={'font-serif text-[15px] leading-relaxed text-[#bbccdd]'} />

            <div className={'mt-auto flex flex-row items-center justify-between text-xs text-[#99aabb]'}>
                <div className={'flex flex-row items-center gap-1'}>
                    <FavoriteIcon sx={{fontSize: 14}}/>
                    <span>{(review.likes ?? 0).toLocaleString()} {review.likes === 1 ? 'like' : 'likes'}</span>
                </div>
                <span>{review.date ? formatDateString(review.date) : ''}</span>
            </div>
        </>
    );
}

/**
 * Metacritic's layout: the user's score (0-10) in its coloured square,
 * the username and the date beside it, then the text.
 */
function MetacriticReview({review, name}: { review: WebReview; name: string }) {
    return (
        <>
            <div className={'flex flex-row gap-3 items-center'}>
                {review.rating !== null &&
                    <span
                        aria-label={`User score ${review.rating} out of 10`}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${metacriticColour(review.rating * 10)}`}
                    >
                        {review.rating}
                    </span>
                }
                <div className={'flex min-w-0 flex-col'}>
                    <p className={'truncate text-sm font-bold'}>{name}</p>
                    {review.date && <p className={'text-xs text-white/60'}>{formatDateString(review.date)}</p>}
                </div>
            </div>

            <Excerpt text={review.text} lines={8} className={'text-sm leading-relaxed text-gray-200'} />
        </>
    );
}

/**
 * A user review from another site, read-only, each in its own site's layout
 * on the store's glass card. (The store's own reviews are UserReviewItem.)
 */
export default function WebReviewItem({ item }: { item: WebReview }) {
    const name = item.user?.name ?? 'Anonymous';
    const Layout = item.source === 'imdb' ? ImdbReview : item.source === 'letterboxd' ? LetterboxdReview : MetacriticReview;

    return (
        <div className={`w-[300px] h-[280px] isolate overflow-hidden rounded-xl ${GLASS_CARD}`}>
            <div className={'flex h-full w-full flex-col gap-2 p-4'}>
                <Layout review={item} name={name} />
            </div>
        </div>
    )

}
