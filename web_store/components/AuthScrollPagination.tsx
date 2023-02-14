import React, {MutableRefObject, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft, faAngleRight, faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {Movie} from "../models/Movie";
import useSWR from "swr";
import {CardStyle} from "./CardStyle";
import MovieCard from "./MovieCard";
import {auth, axiosInstance} from "../utils/firebase";
import {Bookmark} from "../models/Bookmark";
import {ContentType} from "./ContentType";
import {ViewType} from "./ViewType";
import {Review} from "../models/Review";
import ReviewCard from "./ReviewCard";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import useSWRInfinite from "swr/infinite";
import { useIdToken } from 'react-firebase-hooks/auth';


type AppProps = {
    path: string
    style: CardStyle
    type: ContentType
    view: ViewType
    title?: string
}

let fetcher = (url: string) => axiosInstance.get(url).then((response: { data: any; }) => response.data.content)
let PAGE_SIZE = 5;

export default function AuthScrollPagination({path, style, type, view, title}: AppProps) {
    let scrl = useRef() as MutableRefObject<HTMLDivElement>;
    const [page, setPage] = useState(0);
    const [last, setLast] = useState(false);
    const [limit, setLimit] = React.useState(10);
    const [scroll, setScroll] = useState(0);
    const [scrollEnd, setScrollEnd] = useState(false);


    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User is signed in.");
        } else {
            console.log("No user is signed in.");
        }
    });

    //const [idToken, loading, error] = useIdToken(auth.currentUser);


    const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
        (index) =>
            `${path}&limit=${PAGE_SIZE}&page=${
                index
            }`,
        fetcher
    );

    const items = data ? [].concat(...data) : [];
    const isLoadingInitialData = !data && !error;
    const isLoadingMore =
        isLoadingInitialData ||
        (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.length === 0;
    const isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);
    const isRefreshing = isValidating && data && data.length === size;

    const slide = (shift: any) => {
        scrl.current.scrollLeft += shift;
        setScroll(scroll + shift);

        //For checking if the scroll has ended
        if (
            Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
            scrl.current.offsetWidth
        ) {
            setScrollEnd(true);
        } else {
            setScrollEnd(false);
        }
    }

    //This will check scroll event and checks for scroll end
    const scrollCheck = () => {
        setScroll(scrl.current.scrollLeft);
        if (
            Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
            scrl.current.offsetWidth
        ) {

            if (isReachingEnd) {
                setScrollEnd(true);
            }
            else {
                setSize(size + 1);
            }
        } else {
            setScrollEnd(false);
        }
    };

    const loadMore = () => {
        if(!last) {
            setPage(page + 1);
        }
    }

    return (
        <>

            {items && items.length > 0 && (
                <>
                    {title &&
                        <Box className="header"
                             sx={{
                                 backgroundColor: theme => theme.palette.background.paper,
                             }
                             }>

                            <Box className="header__sub" style={
                                {
                                    display:'flex',
                                    flexDirection:'row',
                                    alignItems:'center',
                                    gap:'10px',
                                }
                            }>

                                <Box className="container__main__shape"></Box>
                                <Typography
                                    sx={{
                                        color: theme => theme.palette.primary.contrastText,
                                    }}
                                    variant="h5"className="container__header__title">{title}</Typography>
                            </Box>

                            <Divider style={
                                {
                                    width: '100%',
                                    height: '4px',
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                    borderRadius: '1px',
                                }}></Divider>
                        </Box>

                    }
                    {view === ViewType.HORIZONTAL && (
                        <Box
                            sx={
                                {
                                    backgroundColor: theme => theme.palette.background.paper,
                                    position: 'relative',
                                    padding: '10px 0px',
                                    width: '100%',
                                }
                            }>
                            {scroll !== 0 && (
                                <div className="button" onClick={() => slide(-150)}>
                                    <FontAwesomeIcon icon={faChevronLeft} size="3x" color="#0F52BA"/>
                                </div>
                            )}

                            <div className="container__scroll" ref={scrl} onScroll={scrollCheck}>
                                <div className="container-fluid">
                                    <div className="row flex-row flex-nowrap g-2 ">

                                        {type === ContentType.MOVIE && items.map((movie: Movie, index) => (
                                            <div key={index} className="col" >
                                                <MovieCard style={style} movie={movie as Movie} />
                                            </div>
                                        ))}
                                        {type === ContentType.BOOKMARK && items.map((bookmark: Bookmark, index) => (
                                            <div key={index} className="col" >
                                                <MovieCard style={style} movie={bookmark.movie as Movie}/>
                                            </div>
                                        ))}

                                        {type === ContentType.REVIEW && items.map((review: Review, index) => (
                                            <div key={index} className="col" >
                                                <ReviewCard review={review as Review}/>
                                            </div>

                                        ))}

                                    </div>
                                </div>
                            </div>

                            {!scrollEnd && (
                                <div className="button" style={{right: '0', top: '0'}} onClick={() => slide(150)}>
                                    <FontAwesomeIcon icon={faChevronRight} size="3x" color="#0F52BA"/>
                                </div>
                            )}

                        </Box>
                    )}

                    {view === ViewType.VERTICAL && (
                        <Box className="container-fluid" sx={
                            {
                                padding: 1,
                                backgroundColor: theme => theme.palette.background.paper,

                            }
                        }>
                            <div className="row flex-row flex-wrap g-2 ">
                                {type === ContentType.MOVIE && items.map((movie: Movie) => (
                                    <div key={movie.id} className="col" >
                                        <MovieCard style={style} movie={movie}/>
                                    </div>
                                ))}
                                {type === ContentType.BOOKMARK && items.map((bookmark: Bookmark) => (
                                    <div key={bookmark.id} className="col" >
                                        <MovieCard style={style} movie={bookmark.movie}/>
                                    </div>
                                ))}
                            </div>
                        </Box>
                    )}
                </>
            )}

        </>

    )

}