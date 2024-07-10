
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {Info} from "@mui/icons-material";
import * as React from "react";


function TestCard({movie}: {movie: Movie}) {
    const router = useRouter();

    function handleCardClick(movieId: string) {
        router.push(`/movie/${movieId}`);
    }

    function testURL(url: string) {

        if (url == null) {
            return false
        }
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    return (
        <Box className={"group bg-zinc-900 col-span relative h-[15vw] w-[25vw]"}>
            <img src={movie.poster} alt="Movie" draggable={false} className="
                cursor-pointer
                object-cover
                transition
                duration
                shadow-xl
                rounded-md
                group-hover:opacity-90
                sm:group-hover:opacity-0
                delay-300
                w-full
                h-[15vw]" />

            <Box className="
                    absolute
                    top-0
                    transition
                    duration-200
                    z-10
                    sm:visible
                    delay-300
                    w-full
                    scale-0
                    group-hover:focus-within:scale-100
                    group-hover:focus:scale-100
                    group-hover:scale-110
                    group-hover:-translate-y-[6vw]
                    group-hover:translate-x-[2vw]
                    group-hover:opacity-100">

                <img  src={movie.poster} alt="Movie" draggable={false} className="
                      cursor-pointer
                      object-cover
                      transition
                      duration
                      shadow-xl
                      rounded-t-md
                      w-full
                      h-[12vw]" />

                <Box className="
                      z-10
                      bg-zinc-800
                      p-2
                      lg:p-4
                      absolute
                      w-full
                      transition
                      shadow-md
                      rounded-b-md
                      ">
                    <Typography variant="h6" component="div" className="text-white font-semibold">
                        {movie.title}
                    </Typography>

                    <Box className="flex flex-row items-start align-content-center gap-1">

                        <Typography variant="subtitle2" className="text-white ">{movie.year}</Typography>

                        <Typography className="text-white">&bull;</Typography>

                        {movie.rated && movie.rated !== "NR" &&
                            <Typography variant="subtitle2" className="text-white">{movie.rated}</Typography>
                        }

                        <Typography className="text-white">&bull;</Typography>

                        {movie.genres && movie.genres.length > 0 && (
                            <Typography variant="subtitle2" className="text-white">{movie.genres[0]}</Typography>
                        )}
                    </Box>

                    <Typography variant="subtitle2"
                                className="text-white text-opacity-80 overflow-ellipsis overflow-hidden">
                        {movie.plot}
                    </Typography>

                    <Button variant="contained" className="mt-2 w-full"
                            onClick={() => handleCardClick(movie.movieId)}>
                        <Info className="mr-2" />
                        More Info
                    </Button>

                </Box>
            </Box>
        </Box>
    )
}

export default TestCard;