import type { Metadata } from 'next'
import Movie from "./Movie"

const API_URL_MOVIE: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/`;

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params;
    try {
        const res = await fetch(`${API_URL_MOVIE}${encodeURIComponent(id)}`);
        if (res.ok) {
            const movie = await res.json();
            if (movie?.title) {
                return {
                    title: movie.year ? `${movie.title} (${movie.year})` : movie.title,
                    description: movie.plot || undefined,
                };
            }
        }
    } catch {
        // Fall through: a failed lookup shouldn't break the page, and the
        // client fetch will show its own error.
    }
    return { title: 'Movie' };
}

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    return (
        <Movie  id={id} />
    )
}
