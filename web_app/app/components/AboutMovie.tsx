import React from "react";
import Link from "next/link";
import { Movie } from "@/lib/models/Movie";

/** What each content rating means (MPA wording). */
const RATING_MEANING: Record<string, string> = {
    "G": "General audiences. All ages admitted.",
    "PG": "Parental guidance suggested. Some material may not be suitable for children.",
    "PG-13": "Parents strongly cautioned. Some material may be inappropriate for children under 13.",
    "R": "Restricted. Under 17 requires an accompanying parent or adult guardian.",
    "NC-17": "Adults only. No one 17 and under admitted.",
};

const ACTING = new Set(["actor", "actress"]);

/** "Dan O'Bannon, Dan O'Bannon" -> ["Dan O'Bannon"]: the data repeats writers. */
const uniqueNames = (list?: string) =>
    [...new Set((list ?? "").split(",").map((s) => s.trim()).filter(Boolean))];

/** "117" -> "1h 57m"; anything else is shown as stored. */
function runtime(value?: string) {
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes <= 0) return value || null;
    const h = Math.floor(minutes / 60);
    return h ? `${h}h ${minutes % 60}m` : `${minutes}m`;
}

/** Label and value inline, so a long list runs on after the label and wraps under it. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <dt className="inline text-white/50">{label}: </dt>
            <dd className="inline text-white/90">{children}</dd>
        </div>
    );
}

/** Links separated by commas. */
function LinkList({ items }: { items: { key: string | number; href: string; label: string }[] }) {
    return (
        <>
            {items.map((item, n) => (
                <React.Fragment key={item.key}>
                    {n > 0 && ", "}
                    <Link href={item.href} className="hover:underline">{item.label}</Link>
                </React.Fragment>
            ))}
        </>
    );
}

/**
 * "About <Title>" for the movie preview: director, cast, writer, genres,
 * keywords, runtime and maturity rating, each only when the data has it. Cast
 * link to their pages and keywords to a search for them.
 */
export default function AboutMovie({ movie }: { movie: Movie }) {
    const cast = (movie.cast ?? []).filter((c) => c.category && ACTING.has(c.category) && c.id);
    const writers = uniqueNames(movie.writer);
    const directors = uniqueNames(movie.director);
    const tags = (movie.tags ?? []).slice(0, 10);
    const length = runtime(movie.runtime);
    const rating = movie.rated && RATING_MEANING[movie.rated] ? movie.rated : null;

    return (
        <section aria-labelledby="about-movie" className="flex flex-col gap-3">
            <h3 id="about-movie" className="text-xl">
                About <span className="font-semibold">{movie.title}</span>
            </h3>
            <dl className="flex flex-col gap-1.5 text-sm">
                {directors.length > 0 && <Row label={directors.length > 1 ? "Directors" : "Director"}>{directors.join(", ")}</Row>}
                {cast.length > 0 && (
                    <Row label="Cast">
                        <LinkList items={cast.map((c) => ({ key: c.id, href: `/cast/${c.id}`, label: c.name }))} />
                    </Row>
                )}
                {writers.length > 0 && <Row label={writers.length > 1 ? "Writers" : "Writer"}>{writers.join(", ")}</Row>}
                {movie.genres?.length > 0 && <Row label="Genres">{movie.genres.join(", ")}</Row>}
                {tags.length > 0 && (
                    <Row label="Keywords">
                        <LinkList items={tags.map((t) => ({ key: t.tag_id, href: `/search?tags=${t.tag_id}`, label: t.name }))} />
                    </Row>
                )}
                {length && <Row label="Runtime">{length}</Row>}
                {rating && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                        <dt className="text-white/50">Maturity rating:</dt>
                        <dd className="flex items-center gap-2 text-white/90">
                            <span className="rounded-sm px-1.5 text-xs font-semibold leading-5 ring-1 ring-inset ring-white/50">{rating}</span>
                            {RATING_MEANING[rating]}
                        </dd>
                    </div>
                )}
            </dl>
        </section>
    );
}
