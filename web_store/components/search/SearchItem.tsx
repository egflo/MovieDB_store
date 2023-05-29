import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import * as React from "react";
import {useRouter} from "next/router";
import {useEffect, useRef, useState} from "react";
import {DetailedCard} from "../cards/DetailedCard";

interface SearchItemProps {
    movie: Movie
}

export const SearchItem = (props: SearchItemProps) => {
    const router = useRouter();
    const {movie} = props;
    const ref = useRef<Element | null>(null)
    const [mounted, setMounted] = useState(false)
    const [edge, setEdge] = useState(false)


    function edgeOfScreen() {
        if (ref.current == null) {
            return false;
        }
        const rect = ref.current.getBoundingClientRect();
        return (
            rect.top < 0 ||
            rect.left < 0 ||
            rect.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
            rect.right + 500 > (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // @ts-ignore
    return (
        <Box
            ref={ref}
            onMouseEnter={() => {
                setEdge(edgeOfScreen())
            }}
            onMouseLeave={() => {
                setEdge(false)
            }}
        >
            <DetailedCard movie={movie} />
        </Box>
    );
}
