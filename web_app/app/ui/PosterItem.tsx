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
                <div className="flex flex-col items-center justify-center w-full h-full isolate aspect-video  bg-gray-400/20 shadow-lg ring-1 ring-black/5 rounded-lg">
                    <LocalMoviesIcon fontSize="medium"/>
                    <p className="text-sm text-white font-bold text-center m-2">
                        {movie.title}</p>
                </div>
            )}
        </div>
    );
}