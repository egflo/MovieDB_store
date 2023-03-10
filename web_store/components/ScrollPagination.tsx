import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft, faAngleRight, faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {Movie} from "../models/Movie";
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
import useSWRInfinite from "swr/infinite";
import { useIdToken } from 'react-firebase-hooks/auth';
import Header from "./Header";
import useOnScreen from "../hooks/useOnScreen";
import {CircularProgress} from "@mui/material";

type AppProps = {
    path: string
    style: CardStyle
    type: ContentType
    view: ViewType
    title?: string
    token?: String
}

let fetcher = (url: string) => axiosInstance.get(url).then((response: { data: any; }) => response.data.content)
const PAGE_SIZE = 10;
const getKey = (index: any, previousPageData: any, path: any, pageSize: any) => {
    if (previousPageData && !previousPageData.length) return null // reached the end
    return `${path}&limit=${PAGE_SIZE}&page=${index}`
}
export default function ScrollPagination({path, style, type, view, title, token}: AppProps) {
    let scrl = useRef() as MutableRefObject<HTMLDivElement>;
    let ref = useRef() as MutableRefObject<HTMLDivElement>;

    const isVisible = useOnScreen(ref);

    const [page, setPage] = useState(0);
    const [last, setLast] = useState(false);
    const [limit, setLimit] = React.useState(10);
    const [scroll, setScroll] = useState(0);
    const [scrollEnd, setScrollEnd] = useState(false);


    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
        (...args) => getKey(...args, path, PAGE_SIZE),
        fetcher
    )

    const items = data ? [].concat(...data) : [];
    const isLoadingInitialData = !data && !error;
    const isLoadingMore =
        isLoadingInitialData ||
        (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.length === 0;
    const isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);
    const isRefreshing = isValidating && data && data.length === size;


    useEffect(() => {
        if (isVisible && !isReachingEnd && !isRefreshing) {
            setSize(size + 1)
        }
    }, [isVisible, isRefreshing])

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
    const scrollCheckHorizontal = () => {
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

    const scrollCheckVertical = () => {

        //Main Window Scroll Position
        let scrollPosition = window.pageYOffset;

        //Window Height
        let windowHeight = window.innerHeight;

        //Document Height
        let documentHeight = document.body.offsetHeight;

        console.log("scrollPosition: " + scrollPosition);

        //Scroll End
        if (scrollPosition + windowHeight >= documentHeight) {
            if (isReachingEnd) {
                setScrollEnd(true);
            }
            else {
                setSize(size + 1);
            }
        }
    }

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

                        <Header title={title} />

                    }
                    {view === ViewType.HORIZONTAL && (
                        <Box
                            sx={{position: 'relative'}}>
                            {scroll !== 0 && (
                                <div className="button" onClick={() => slide(-150)}>
                                    <FontAwesomeIcon icon={faChevronLeft} size="3x" color="#0F52BA"/>
                                </div>
                            )}

                            <Box className="container__scroll" ref={scrl} onScroll={scrollCheckHorizontal}>
                                <Box className="container-fluid">
                                    <Box className="row flex-row flex-nowrap g-2 ">

                                        {type === ContentType.MOVIE && items.map((movie: Movie, index) => (
                                            <Box key={index} className="col" >
                                                <MovieCard style={style} movie={movie as Movie} />
                                            </Box>
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

                                    </Box>
                                </Box>
                            </Box>

                            {!scrollEnd
                                && (
                                <div className="button" style={{right: '0', top: '0'}} onClick={() => slide(150)}>
                                    <FontAwesomeIcon icon={faChevronRight} size="3x" color="#0F52BA"/>
                                </div>
                            )}

                        </Box>
                    )}

                    {view === ViewType.VERTICAL && (
                        <Box className="container-fluid" sx={{padding: 1}}>
                            {isEmpty ?
                                <Box className="row flex-row flex-wrap g-2">
                                    <Box className="col" >
                                        <Typography variant="h6" component="h6" gutterBottom>
                                            No Content
                                        </Typography>
                                    </Box>
                                </Box> : null}

                            <Box className="row flex-row flex-wrap g-2">
                                {type === ContentType.MOVIE && items.map((movie: Movie) => (
                                    <Box key={movie.id} className="col" >
                                        <MovieCard style={style} movie={movie}/>
                                    </Box>
                                ))}
                                {type === ContentType.BOOKMARK && items.map((bookmark: Bookmark) => (
                                    <div key={bookmark.id} className="col" >
                                        <MovieCard style={style} movie={bookmark.movie}/>
                                    </div>
                                ))}
                            </Box>
                            <Box ref={ref}>
                                {isLoadingMore ? <CircularProgress/> : isReachingEnd ? 'Done' : ''}
                            </Box>
                        </Box>
                    )}
                </>
            )}

        </>

    )

}