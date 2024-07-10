
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import TheatersIcon from "@mui/icons-material/Theaters";
import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {Info} from "@mui/icons-material";
import * as React from "react";
import Favorite from "../actions/Favorite";
import Rate from "../actions/Rate";
import Cart from "../actions/Cart";
import {Chip} from "@mui/material";


function HorizontalCard({movie}: {movie: Movie}) {
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

    //Poster on left and movie info on right
    return (
        <Card>
            <Box className={"flex flex-row"}>
                <img src={movie.poster} alt="Movie" draggable={false} className="
                    cursor-pointer
                    object-cover
                    transition
                    duration
                    shadow-xl
                    rounded-md
                    w-40
                    h-full" />


                <Box className={"flex flex-col w-full"}>

                    <Box className="flex flex-col items-start gap-2 h-full pl-4 pr-2 pt-2">
                        <Typography variant="h5" className="text-opacity-80 overflow-ellipsis overflow-hidden line-clamp-1">
                            {movie.title}
                        </Typography>

                        <Box className="flex flex-row items-start align-content-center gap-1">
                            <Chip label={movie.year} size="small"/>

                            {movie.rated &&
                                <Chip label={movie.rated} size="small"/>
                            }

                            {movie.genres && movie.genres.length > 0 && (
                                <Chip label={movie.genres[0]} size="small"/>
                            )}
                        </Box>


                        <Typography variant="subtitle2" className="text-opacity-80 overflow-ellipsis overflow-hidden line-clamp-4">
                            {movie.plot}
                        </Typography>
                    </Box>


                    <Box className="flex flex-row items-end gap-2  bg-black bg-opacity-50 align-items-end justify-end">

                        <Favorite movie={movie}/>

                        <Rate movie={movie}/>

                        <Cart movie={movie}/>

                    </Box>


                </Box>
            </Box>
        </Card>
    )
}

export default HorizontalCard;