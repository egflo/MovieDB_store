import {Movie} from "@/lib/models/Movie";

/** "155" → "2h 35m"; "45" → "45m"; "120" → "2h". Null for missing or "N/A". */
export function formatRuntime(runtime: string | number | null | undefined): string | null {
    const minutes = parseInt(String(runtime ?? ''), 10);
    if (!Number.isFinite(minutes) || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest}m`;
    return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/**
 * Year, content rating and runtime on one line, all the same size. The rating
 * is text in an outlined box rather than an image: the old SVG badges each had
 * their own artwork and hard-coded size (up to 22px against 14px text), and
 * only covered G, PG, PG-13 and R, while the data also has TV-MA, TV-14,
 * "Not Rated" and others.
 */
export default function SubSection({ movie }: { movie: Movie }) {
    const rated = movie.rated && movie.rated !== 'N/A' ? movie.rated : null;
    const runtime = formatRuntime(movie.runtime);

    const items: React.ReactNode[] = [];
    if (movie.year) items.push(<span key="year">{movie.year}</span>);
    if (rated) {
        items.push(
            <span
                key="rated"
                aria-label={`Rated ${rated}`}
                // h-5 matches the text's 20px line height; the border sits
                // inside it, so the badge is no taller than the words.
                className="inline-flex h-5 items-center rounded-[4px] px-1.5 leading-none ring-1 ring-inset ring-white/70"
            >
                {rated}
            </span>,
        );
    }
    if (runtime) items.push(<span key="runtime">{runtime}</span>);

    if (items.length === 0) return null;

    return (
        <div className="flex flex-row flex-wrap items-center gap-2 text-sm font-semibold leading-5 text-white">
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true" className="text-white/60">•</span>}
                    {item}
                </span>
            ))}
        </div>
    );
}
