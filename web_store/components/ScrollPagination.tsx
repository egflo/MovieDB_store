import React, {MutableRefObject, useEffect, useRef, useState} from "react";

import {Movie} from "../models/Movie";
import {CardStyle} from "./CardStyle";
import MovieCard from "./MovieCard";
import {auth, axiosInstance} from "../utils/firebase";
import {ContentType} from "./ContentType";
import {ViewType} from "./ViewType";
import {Review} from "../models/Review";
import ReviewCard from "./cards/ReviewCard";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useSWRInfinite from "swr/infinite";
import useOnScreen from "../hooks/useOnScreen";
import {CircularProgress} from "@mui/material";
import useAuthContext from "../hooks/useAuthContext";
import {ChevronRight} from "@mui/icons-material";
import {ChevronLeft} from "@mui/icons-material";
import {CriticReview} from "../models/CriticReview";
import CriticReviewCard from "./cards/CriticReviewCard";
import {OrderCard} from "./order/OrderCard";
import {Order} from "../models/Order";


type AppProps = {
    path: string
    style: CardStyle
    type: ContentType
    view: ViewType
    title?: string
    token?: string | undefined
}

let fetcher = (path: string, token: string | undefined) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return axiosInstance.get(path).then(res => res.data.content)
}

const PAGE_SIZE = 10;
const getKey = (index: any, previousPageData: any, path: any, pageSize: any) => {
    if (previousPageData && !previousPageData.length) return null // reached the end
    return `${path}&limit=${PAGE_SIZE}&page=${index}`
}
export default function ScrollPagination({path, style, type, view, title, token}: AppProps) {
    let scrl = useRef() as MutableRefObject<HTMLDivElement>;
    let ref = useRef() as MutableRefObject<HTMLDivElement>;
    const isVisible = useOnScreen(ref);
    const auth = useAuthContext();

    const[show, setShow] = useState(false);
    const [page, setPage] = useState(0);
    const [last, setLast] = useState(false);
    const [scroll, setScroll] = useState(0);
    const [scrollEnd, setScrollEnd] = useState(false);


    const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
        (...args) => getKey(...args, path, PAGE_SIZE),
        (...args) => fetcher(...args, token),
        {
           // revalidateOnFocus: false,
        }
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


    return (
        <>
            {items && items.length > 0 && (

                <>

                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                    }}
                    onMouseEnter={() => setShow(true)}
                    onMouseLeave={() => setShow(false)}
                >
                    {view === ViewType.HORIZONTAL && (

                        <>
                            {title && (

                                <Box className="title" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: 5, height: 24, backgroundColor: 'primary.main', borderRadius:1 }} />

                                    <Typography variant="h6" sx={{ color: "white", marginLeft: 1}}>
                                        {title}
                                    </Typography>
                                </Box>
                            )}

                            {scroll !== 0 && (
                                <Box className="button-container"
                                     sx={{left: '10px', top: '50%', opacity: show ? 0.95 : 0, transition: 'opacity 0.5s'}}>
                                    <Box className="button" onClick={() => slide(-450)}>
                                        <ChevronLeft fontSize={"large"} color="inherit" sx={{color: "white"}}/>
                                    </Box>
                                </Box>
                            )}

                            <div className="container__scroll " ref={scrl} onScroll={scrollCheckHorizontal}>

                                <Box className="container-fluid">

                                    <Box className="row flex-row flex-nowrap gap-3">

                                        {type === ContentType.MOVIE && items.map((movie: Movie, index) => (
                                            <Box key={index} className="col p-0">
                                                <MovieCard style={style} movie={movie as Movie}/>
                                            </Box>
                                        ))}

                                        {type === ContentType.REVIEW && items.map((review: Review, index) => (
                                            <div key={index} className="col p-0">
                                                <ReviewCard review={review as Review}/>
                                            </div>

                                        ))}

                                        {type === ContentType.CRITIC_REVIEW && items.map((review: CriticReview, index) => (
                                            <div key={index} className="col p-0">
                                                <CriticReviewCard review={review as CriticReview}/>
                                            </div>
                                        ))}

                                        {type === ContentType.ORDER && items.map((order: Order, index) => (
                                            <div key={index} className="col p-0">
                                                <OrderCard order={order as Order}/>
                                            </div>
                                        ))}

                                    </Box>
                                </Box>
                            </div>

                            {!scrollEnd
                                && (
                                    <Box className="button-container"
                                         sx={{right: '10px', top: '50%', opacity: show ? 0.95 : 0, transition: 'opacity 0.5s'}}>
                                        <Box className="button" onClick={() => slide(450)}>
                                            <ChevronRight fontSize={"large"} color="inherit" sx={{color: "white"}}/>
                                        </Box>
                                    </Box>
                                )}

                        </>
                    )}

                    {view === ViewType.VERTICAL && (

                        <>
                            <Box className="container-fluid">
                                {isEmpty ?
                                    <Box className="row flex-row flex-wrap g-2">
                                        <Box className="col">
                                            <Typography variant="h6" component="h6" gutterBottom>
                                                No Content
                                            </Typography>
                                        </Box>
                                    </Box> : null}

                                <Box className="row flex-row flex-wrap g-4 justify-content-center">
                                    {type === ContentType.MOVIE && items.map((movie: Movie) => (
                                        <Box key={movie.id} className="col flex-grow-0">
                                            <MovieCard style={style} movie={movie}/>
                                        </Box>
                                    ))}
                                </Box>

                            </Box>


                            <div ref={ref}>
                                {isLoadingMore ? <CircularProgress/> : isReachingEnd ? 'Done' : ''}
                            </div>

                        </>

                    )}

                </Box></>
            )}

        </>

    )

}

