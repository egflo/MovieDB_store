
"use client"
import useSWR from "swr";
import ProfileImage from "@/app/components/ProfileImage";
import {useState} from "react";
import {Movie} from "@/app/models/Movie";
import {Page} from "@/app/models/Page";
import PosterItem from "@/app/ui/PosterItem";
import {CastDetails} from "@/app/models/CastDetails";


interface CastProps {
    id: string;
}

const API_URL_MOVIES: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/cast/`;
const API_URL_CAST: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/cast/`;


function Films({id}: { id: string }) {
    const {data, error} = useSWR<Page<Movie>>(`${API_URL_MOVIES}${id}?limit=50`, fetcher, {
        revalidateOnFocus: false,
        refreshInterval: 0,
    });

    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
            <div className="flex flex-wrap gap-4 justify-center">
                {data.content.map((movie: Movie) => (
                    <div key={movie.id} className="flex flex-col items-center gap-2">
                        <PosterItem item={movie} size={"small"} />
                    </div>
                ))}
            </div>
        </div>
    );
}

const CHARACTER_LIMIT = 500;
const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function Cast({ id }: CastProps) {
    const [showMore, setShowMore] = useState(false);
    const {data, isLoading, error} = useSWR<CastDetails>(`${API_URL_CAST}${id}`, fetcher, {
        revalidateOnFocus: false,
        refreshInterval: 0,
    });

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <div className={"flex flex-col items-center gap-2"}>
                <ProfileImage
                    name={data.name}
                    imageUrl={data.photo}
                    size={180}
                />
                <h1 className="text-2xl font-bold text-white">{data.name}</h1>

                {data.birthplace && (
                    <p className="text-md text-white">
                        {data.birthplace}
                    </p>
                )}

                <div className="text-md text-white">
                    {data.bio.length > CHARACTER_LIMIT ? (
                        <>
                            {!showMore ? `${data.bio.slice(0, CHARACTER_LIMIT)}...` : data.bio}
                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="text-blue-400 hover:text-blue-500 ml-1"
                            >
                                {showMore ? 'Show Less' : 'Read More'}
                            </button>
                        </>
                    ) : data.bio}
                </div>

            </div>

            <Films id={id}></Films>
        </div>
    );
}