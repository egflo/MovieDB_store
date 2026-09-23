import {Movie} from "@/lib/models/Movie";
import React, {useState} from "react";
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import {useRouter} from "next/navigation";
import {fallbackImage, optimizedImage} from "@/lib/image";
import {Score} from "@/lib/score";

interface PosterProps {
    item: Movie;
    /** Optional so PosterItem satisfies ComponentType<{item: Movie}> when used
     *  as an ItemComponent, which renders it with only `item`. */
    size?: PosterSize;
    /** When given, selecting the poster calls this instead of navigating —
     *  used by PosterCarousel to expand a preview in place. */
    onSelect?: (item: Movie, element: HTMLElement) => void;
    /** Text laid over the bottom of the poster on frosted glass (search
     *  results). Inside the card so it scales with the hover zoom. */
    caption?: {title: string; meta?: string; score?: Score | null};
    /** A control in the top-right corner (e.g. the favourite heart). Inside the
     *  card so it scales with the hover zoom; its clicks and key presses don't
     *  reach the card, so using it doesn't also open the movie. */
    topRight?: React.ReactNode;
}

/** "fluid" fills its container's width at a 2:3 shape, for grids whose
 *  columns stretch to fill the row (search results). */
type PosterSize = "small" | "medium" | "large" | "fluid";

const DIMENSIONS = {
    small: [200, 300],
    medium: [300, 450],
    large: [400, 600],
    // Fluid cells are about 160-280px wide; 280 covers the widest at 1x.
    fluid: [280, 420],
} as const;

/** The caption band: solid behind the text (bottom 3.25rem), fading out by 5.25rem. */
const CAPTION_MASK = "[mask-image:linear-gradient(to_top,black_3.25rem,transparent_5.25rem)]";

function sizeClass(size: PosterSize) {
    switch (size) {
        case "fluid":
            return "w-full aspect-[2/3]";
        case "small":
            return "w-[200px] h-[300px] min-w-[200px] min-h-[300px] max-w-[200px] max-h-[300px]";
        case "medium":
            return "w-[300px] h-[450px] min-w-[300px] min-h-[450px] max-w-[300px] max-h-[450px]";
        case "large":
            return "w-[400px] h-[600px] min-w-[400px] min-h-[600px] max-w-[400px] max-h-[600px]";
    }
}

export default function PosterItem({ item, size = "medium", onSelect, caption, topRight }: PosterProps) {
    const movie: Movie = item;
    const router = useRouter();
    const imageUrl = movie.poster;
    const sizeClassName = sizeClass(size ? size : "small");

    // Optimized image, then fallbackImage, then the placeholder. Keyed by url,
    // so a reused component showing a different movie starts over.
    const [failure, setFailure] = useState<{ url: string; count: number } | null>(null);
    const failures = imageUrl && failure?.url === imageUrl ? failure.count : 0;
    const isImageValid = !!imageUrl && failures < 2;
    const [width, height] = DIMENSIONS[size];
    // Shared by the poster and the caption's blurred copy of it, so the copy
    // resolves to the same (already downloaded) file.
    const imageProps = imageUrl && failures === 0
        ? optimizedImage(imageUrl, width, height, size === "fluid" ? "(max-width: 640px) 50vw, 280px" : undefined)
        : { src: imageUrl ? fallbackImage(imageUrl) : '' };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={movie.title}
            onClick={(e) =>
                onSelect
                    ? onSelect(movie, e.currentTarget)
                    : router.push(`/movie/${movie.movieId}`)
            }
            onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                if (onSelect) onSelect(movie, e.currentTarget);
                else router.push(`/movie/${movie.movieId}`);
            }}
            // transition-transform all the time, not only on hover, so the card
            // eases back down instead of snapping when the pointer leaves.
            className={`relative flex items-center justify-center rounded-lg transition-transform duration-300 ease-in-out hover:scale-105
             cursor-pointer text-white font-bold text-xl overflow-hidden ${sizeClassName}`}
        >
            {isImageValid && imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    {...imageProps}
                    alt={movie.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={() => setFailure({ url: imageUrl, count: failures + 1 })}
                />
            ) : (
                // A quiet card rather than a bright grey block, so a missing
                // poster doesn't stand out in a row of real ones.
                // whitespace-normal: scrolling rows set nowrap, which kept long
                // titles on one line and clipped them at both edges.
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 whitespace-normal rounded-lg bg-gradient-to-b from-neutral-800 to-neutral-900 p-4 ring-1 ring-inset ring-white/5">
                    <LocalMoviesIcon fontSize="small" className="text-white/25" aria-hidden="true" />
                    {/* The caption already shows title and year when given. */}
                    {!caption && (
                        <>
                            <p className="line-clamp-3 text-center text-sm font-medium text-white/70">
                                {movie.title}
                            </p>
                            {movie.year != null && (
                                <p className="text-xs font-normal text-white/40">{movie.year}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {caption && (
                // Seamless frosted glass over the bottom of the poster. Not a
                // backdrop-filter: some browsers don't redraw that correctly
                // inside the card's hover scale, so the glass didn't grow with
                // the card. The only thing behind the band is the poster, so a
                // blurred copy of it (a plain filter, which follows the scale
                // everywhere) looks the same. Both layers fade in through the
                // same mask above the text, so there's no hard edge. Nothing here
                // takes clicks from the card.
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    {isImageValid && imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            {...imageProps}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            // scale-110 keeps the blur's soft edges outside the card.
                            className={`absolute inset-0 h-full w-full scale-110 object-cover blur-xl saturate-150 ${CAPTION_MASK}`}
                        />
                    )}
                    <div className={`absolute inset-0 bg-neutral-950/45 ${CAPTION_MASK}`} />
                </div>
            )}
            {topRight && (
                <div
                    className="absolute right-2 top-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    {topRight}
                </div>
            )}
            {caption && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col whitespace-normal px-3 pb-2.5 text-left">
                    <p className="truncate text-sm font-semibold text-white" title={caption.title}>{caption.title}</p>
                    <div className="flex items-center gap-2">
                        {caption.meta && <p className="min-w-0 flex-1 truncate text-xs font-normal text-white/70">{caption.meta}</p>}
                        {caption.score && (
                            <span
                                className="ml-auto flex shrink-0 items-center gap-1 text-xs font-semibold text-white"
                                title={`${caption.score.source}: ${caption.score.value}`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={caption.score.icon} alt={caption.score.source} className="h-3.5 w-auto" />
                                {caption.score.value}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}