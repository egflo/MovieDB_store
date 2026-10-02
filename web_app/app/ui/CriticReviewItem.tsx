import React from "react";
import {CriticReview} from "@/lib/models/CriticReview";
import StarIcon from '@mui/icons-material/Star';
import {GLASS_CARD} from "@/app/ui/glass";
import ProfileImage from "@/app/components/ProfileImage";
import {metacriticColour, rottenTomatoesIcon} from "@/lib/score";

interface  CriticReviewProps {
    item: CriticReview
}

//Ex Aug 9, 2021. In UTC: the dates are stored as midnight UTC, so local
// time showed the day before in the Americas.
function formatDateString(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Metacritic's coloured score square, in the avatar's place and at its size
 *  (as on Metacritic, where the score leads each review). */
function MetacriticScore({score}: { score: number }) {
    return (
        <span
            aria-label={`Metacritic score ${score}`}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${metacriticColour(score)}`}
        >
            {score}
        </span>
    );
}

/** Rotten Tomatoes' verdict: a tomato or a splat, with the critic's own
 *  score beside it when they gave one. */
function Verdict({review}: { review: CriticReview }) {
    return (
        <div className={'flex flex-row items-center gap-2'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={'h-6 w-6 object-contain'}
                 src={rottenTomatoesIcon(review.state === 'rotten' ? 0 : 100, review.state)}
                 alt={review.state === 'rotten' ? 'Rotten' : 'Fresh'}></img>
            {review.score &&
                <p className={'text-sm font-semibold text-white/70'}>
                    {review.score}
                </p>
            }
        </div>
    );
}

/**
 * One critic review card, for Rotten Tomatoes and Metacritic alike, laid out
 * like Rotten Tomatoes' own: the critic (initials, name with a gold star for
 * a Top Critic, publication, date), the verdict, the excerpt, then the link.
 * Metacritic's has its score square instead of the initials and no verdict row.
 */
export default function CriticReviewItem({ item }: CriticReviewProps) {
    const review = item;
    const name = review.critic ?? review.publication ?? 'Critic';
    // Metacritic leads with its score where Rotten Tomatoes has the critic's avatar.
    const metacriticScore = review.source === 'metacritic' ? review.scoreNormalized : null;

    return (
        // overflow-hidden so nothing can spill onto the next card in the row.
        <div className={`w-[320px] h-[270px] isolate overflow-hidden rounded-2xl ${GLASS_CARD}`}>

            <div className={'flex h-full flex-col gap-3 p-4'}>

                <div className="flex flex-row items-start gap-3">
                    {metacriticScore !== null
                        ? <MetacriticScore score={metacriticScore} />
                        : <ProfileImage name={name} size={44} className={'shrink-0'} />
                    }

                    {/* Takes the leftover width and truncates, so a long
                        name or publication stays inside the card. */}
                    <div className={'flex min-w-0 flex-1 flex-col'}>
                        <div className={'flex min-w-0 items-center gap-1'}>
                            <p className={'truncate text-sm font-bold'} title={name}>
                                {name}
                            </p>
                            {review.topCritic &&
                                <StarIcon titleAccess="Top Critic" sx={{fontSize: 16, color: '#f5b50a', flexShrink: 0}}/>
                            }
                        </div>
                        {review.critic && review.publication &&
                            <p className={'truncate text-xs text-white/60'} title={review.publication}>
                                {review.publication}
                            </p>
                        }
                        {/* Metacritic often has no date. */}
                        {review.date &&
                            <p className={'text-xs text-white/60'}>
                                {formatDateString(review.date)}
                            </p>
                        }
                    </div>
                </div>

                {review.source === 'rt' && <Verdict review={review} />}

                <p className={'shrink-0 text-sm leading-relaxed text-gray-200'}
                   style={{
                       textWrap: 'wrap',
                       overflow: 'hidden',
                       display: '-webkit-box',
                       WebkitLineClamp: review.source === 'rt' ? 5 : 7,
                       WebkitBoxOrient: 'vertical',
                   }}
                >
                    {review.text}
                </p>

                {/* Metacritic has no links, and not every Rotten Tomatoes review does. */}
                {review.url &&
                    <a href={review.url} target="_blank" rel="noopener noreferrer" className={'mt-auto text-xs font-semibold text-blue-400 hover:underline'}>
                        Go to Full Review
                    </a>
                }
            </div>
        </div>
    )

}
