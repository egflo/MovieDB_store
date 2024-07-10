import {Movie} from "../models/Movie";
import {CardStyle} from "./CardStyle";
import {SimpleCard} from "./cards/SimpleCard";
import ExpandedCard from "./cards/ExpandedCard";
import {useRouter} from "next/router";
import * as React from "react";
import PosterCard from "./cards/PosterCard";


function MovieCard({style, movie}: {style: CardStyle, movie: Movie}) {
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
       <>
              {style == CardStyle.VERTICAL && <PosterCard movie={movie}/>}
              {style == CardStyle.HORIZONTAL && <SimpleCard movie={movie}/>}
              {style == CardStyle.EXPANDED && <ExpandedCard movie={movie}/>}
       </>

    )

}

export default MovieCard;