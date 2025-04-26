import { notFound } from 'next/navigation'
import Movie from "./Movie"

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

