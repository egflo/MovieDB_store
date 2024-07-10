import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import * as React from "react";
import {useRouter} from "next/router";
import {useEffect, useRef, useState} from "react";
import {DetailedCard} from "../cards/DetailedCard";
import VerticalCard from "../cards/VerticalCard";

interface CarouselItemProps {
    movie: Movie;
    hide: boolean;
    setHide: (hide: boolean) => void;
}


export const CarouselItem = (props: CarouselItemProps) => {
    const router = useRouter();
    const {movie} = props;
    const ref = useRef<Element | null>(null)
    const [mounted, setMounted] = useState(false)

    function handleCardClick(movieId: string) {
        router.push(`/movie/${movieId}`);
    }


    React.useEffect(() => {
        ref.current = document.getElementById(movie.id);
        setMounted(true)
    } , [])

    // @ts-ignore
    return (

        <Box className="carousel-container">
            <Box className="flex justify-between items-center px-4 py-1">
                <Box
                    onMouseEnter={() => props.setHide(true)}
                    onMouseLeave={() => props.setHide(false)}
                    className={"mr-2"}
                >
                    <VerticalCard movie={movie} />
                 </Box>
            </Box>
        </Box>


    );
}
