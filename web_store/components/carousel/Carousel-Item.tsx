import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
    ShoppingBagOutlined,
    FavoriteBorderOutlined,
    Info,
    ThumbDownAltOutlined,
    ThumbUpOffAltOutlined, Remove, ShoppingBag
} from "@mui/icons-material";
import * as React from "react";
import {useRouter} from "next/router";
import {useEffect, useRef, useState} from "react";
import IconButton from "@mui/material/IconButton";
import {Chip} from "@mui/material";
import {ToastType} from "../Toast";
import {auth, axiosInstance} from "../../utils/firebase";
import useToastContext from "../../hooks/useToastContext";
import useAuthContext from "../../hooks/useAuthContext";
import {AxiosResponse} from "axios";
import {Bookmark} from "../../models/Bookmark";
import {DetailedCard} from "../cards/DetailedCard";

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

        <Box
            onMouseEnter={() => props.setHide(true)}
            onMouseLeave={() => props.setHide(false)}
            className={"group relative bg-zinc-900  w-[40vw] md:w-[18vw] md:max-w-[18vw] ]"}

        >

            <DetailedCard movie={movie} />
        </Box>


    );
}
