import {Movie} from "@/lib/models/Movie";
import {useState} from "react";
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import {useRouter} from "next/navigation";
import {fallbackImage, optimizedImage} from "@/lib/image";

interface PosterProps {
    item: Movie;
    /** Optional so PosterItem satisfies ComponentType<{item: Movie}> when used
     *  as an ItemComponent, which renders it with only `item`. */
    size?: "small" | "medium" | "large";
    /** When given, selecting the poster calls this instead of navigating —
     *  used by PosterCarousel to expand a preview in place. */
    onSelect?: (item: Movie, element: HTMLElement) => void;
}

const DIMENSIONS = {
    small: [200, 300],
    medium: [300, 450],
    large: [400, 600],
} as const;

function sizeClass(size: "small" | "medium" | "large") {
    switch (size) {
        case "small":
            return "w-[200px] h-[300px] min-w-[200px] min-h-[300px] max-w-[200px] max-h-[300px]";
        case "medium":
            return "w-[300px] h-[450px] min-w-[300px] min-h-[450px] max-w-[300px] max-h-[450px]";
        case "large":
            return "w-[400px] h-[600px] min-w-[400px] min-h-[600px] max-w-[400px] max-h-[600px]";
    }
}

export default function PosterItem({ item, size = "medium", onSelect }: PosterProps) {
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
            className={`flex items-center justify-center rounded-lg hover:transition duration-300 ease-in-out transform hover:scale-105
             cursor-pointer text-white font-bold text-xl overflow-hidden ${sizeClassName}`}
            style={{ width: sizeClassName, height: sizeClassName }}
        >
            {isImageValid && imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    {...(failures === 0
                        ? optimizedImage(imageUrl, width, height)
                        : { src: fallbackImage(imageUrl) })}
                    alt={movie.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={() => setFailure({ url: imageUrl, count: failures + 1 })}
                />
            ) : (
                // A quiet card rather than a bright grey block, so a missing
                // poster doesn't stand out in a row of real ones.
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-neutral-800 to-neutral-900 p-4 ring-1 ring-inset ring-white/5">
                    <LocalMoviesIcon fontSize="small" className="text-white/25" aria-hidden="true" />
                    <p className="line-clamp-3 text-center text-sm font-medium text-white/70">
                        {movie.title}
                    </p>
                    {movie.year != null && (
                        <p className="text-xs font-normal text-white/40">{movie.year}</p>
                    )}
                </div>
            )}
        </div>
    );
}