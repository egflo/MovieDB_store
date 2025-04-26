import {Movie} from "@/app/models/Movie";
import {useEffect, useState} from "react";
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import {useRouter} from "next/navigation";

interface PosterProps {
    item: Movie;
    size: "small" | "medium" | "large";
}

function sizeClass(size: "small" | "medium" | "large") {
    switch (size) {
        case "small":
            return "w-[200px] h-[300px]";
        case "medium":
            return "w-[300px] h-[450px]";
        case "large":
            return "w-[400px] h-[600px]";
    }
}

export default function PosterItem({ item, size }: PosterProps) {
    const movie: Movie = item;
    const router = useRouter();
    const imageUrl = movie.poster;
    const [isImageValid, setIsImageValid] = useState<boolean>(true);
    const sizeClassName = sizeClass(size ? size : "small");

    useEffect(() => {
        if (!imageUrl) {
            setIsImageValid(false);
            return;
        }

        let isMounted = true;
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            if (isMounted) setIsImageValid(true);
        };
        img.onerror = () => {
            if (isMounted) setIsImageValid(false);
        };

        return () => {
            isMounted = false;
        };
    }, [imageUrl]);

    return (
        <div
            onClick={() => router.push(`/movie/${movie.movieId}`)}
            className={`flex items-center justify-center rounded-lg hover:transition duration-300 ease-in-out transform hover:scale-105
            bg-gray-800 cursor-pointer text-white font-bold text-xl overflow-hidden ${sizeClassName}`}
            style={{ width: sizeClassName, height: sizeClassName }}
        >
            {isImageValid && imageUrl ? (
                <img
                    src={imageUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={() => setIsImageValid(false)}
                />
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-800">
                    <LocalMoviesIcon fontSize="medium"/>
                    <p className="text-sm text-white font-bold text-center m-2">
                        {movie.title}</p>
                </div>
            )}
        </div>
    );
}