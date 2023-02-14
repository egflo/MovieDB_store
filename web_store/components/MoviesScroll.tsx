import useSWR from "swr";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar, faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import {Movie} from "../models/Movie";
import {faAngleRight, faAngleLeft} from "@fortawesome/free-solid-svg-icons";
import React, {MutableRefObject, useRef, useState} from "react";
import {useRouter} from "next/router";
import Scroll from "./Scroll";
import {styled} from "@mui/material/styles";
import MovieCard from "./MovieCard";
import {CardStyle} from "./CardStyle";


const header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

const fetcher = (url: string) => fetch(url,
    { method: "GET", mode: 'cors', headers: { 'Content-Type': 'application/json',}}).then(response => response.json())


type AppProps = {
    path: string
}


export function MoviesScroll({path}: AppProps) {
    let router = useRouter();

    const { data, error } = useSWR(path, fetcher)
    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>

    function testURL(url: string) {
        if (url == null) {
            return false
        }
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    function onCardClick(id: string) {
        router.push('/movie/' + id);
    }

    return (

        <Scroll>
                <div className="container-fluid">
                    <div className="row flex-row flex-nowrap">
                        {data.content.map((movie: Movie) => (
                            <div key={movie.id} className="col" >

                                <MovieCard style={CardStyle.HORIZONTAL} movie={movie} />

                            </div>
                        ))}
                    </div>

                </div>
        </Scroll>
    )
}