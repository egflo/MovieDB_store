import type { Metadata } from 'next'
import Cast from "./Cast"

const API_URL_CAST: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/cast/`;

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params;
    try {
        const res = await fetch(`${API_URL_CAST}${encodeURIComponent(id)}`);
        if (res.ok) {
            const { name } = await res.json();
            if (name) return { title: name };
        }
    } catch {
        // Fall through: a failed lookup shouldn't break the page, and the
        // client fetch will show its own error.
    }
    return { title: 'Cast' };
}

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    return (
        <Cast id={id} />
    )
}
