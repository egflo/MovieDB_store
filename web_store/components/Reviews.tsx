

import useSWR from 'swr'
import {Review} from "../models/Review";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar, faThumbsUp, faThumbsDown, faAngleLeft, faAngleRight} from "@fortawesome/free-solid-svg-icons";
import {Backdrop, CircularProgress} from "@mui/material";
import React, {MutableRefObject, useRef, useState} from "react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbDown from "@mui/icons-material/ThumbDown";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReviewCard from "./ReviewCard";

const bull = (
    <Box
        component="span"
        sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
    >
        •
    </Box>
);

const API_URL_REVIEWS: string = 'http://localhost:8080/review/movie/';

const header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

const fetcher = (url: string) => fetch(url,
    { method: "GET", mode: 'cors', headers: { 'Content-Type': 'application/json',}}).then(response => response.json())


export function Reviews({id}: {id: string}) {

    let scrl = useRef() as MutableRefObject<HTMLDivElement>;
    const [thumbsUp, setThumbsUp] = useState(false);
    const [thumbsDown, setThumbsDown] = useState(false);

    const [scroll, setScroll] = useState(0);
    const [scrollEnd, setScrollEnd] = useState(false);
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<{data: Review | null}>({data: null});

    const { data, error } = useSWR(API_URL_REVIEWS + id, fetcher)
    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>
    if(data.totalElements === 0) return <></>

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
            setScrollEnd(true);
        } else {
            setScrollEnd(false);
        }
    };

    function handleClose() {
        setOpen(false);
    }

    function handleCardClick(value: Review) {
        setOpen(true);
        setState({ data: value});
    }

    function ExpandReview() {

        if (state.data == null) {
            return <CircularProgress/>
        }
        else {
            return (
                <div className="card" style={{
                    width: '50vw',
                    height: '70vh',
                    color: 'black',
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                }}>
                    <div className="card-body">
                        <h5 className="card-title">{state.data.title}</h5>

                        <div className="card-subtitle mb-2">
                            <h6 className="text-muted">
                                {state.data.user.firstname} {state.data.user.lastname}</h6>

                            <FontAwesomeIcon icon={faStar} color="gold" />
                            <span className="rating-head"> {state.data.rating} </span>
                            <span style={{color:'gray', fontSize: '0.8rem'}} className="rating-tail"> / 10 </span>
                        </div>

                        <div className="card-text">
                            <p style={
                                {
                                    width: '100%',
                                    overflow: 'auto',
                                    textOverflow: 'ellipsis',


                                }

                            }
                            >{state.data.text}</p>
                        </div>

                    </div>
                </div>
            )
        }
    }

    return (
        <>


                {scroll !== 0 && (
                    <div className="button" onClick={() => slide(-150)}>
                        <FontAwesomeIcon icon={faAngleLeft} size="3x" color="#0070FF"/>
                    </div>
                )}

                <div className="container__scroll" ref={scrl}>
                        <div className="container-fluid">
                            <div className="row flex-row flex-nowrap">
                                {data.content.map((review: Review) => (
                                    <div key={review.id} className="col">

                                        <ReviewCard review={review}/>


                                        {/*

                                  <div className="card review-card" style={{
                                    width: '18rem',
                                    height: '25rem',
                                    boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                                }}>
                                    <div className="card-body">
                                        <h5 className="card-title"
                                            style={
                                                {
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    width: '100%',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',

                                                }

                                            }>{review.title}</h5>


                                        <div className="card-subtitle mb-2">
                                            <h6 className="text-muted">
                                                {review.user.firstname} {review.user.lastname}</h6>

                                            <FontAwesomeIcon icon={faStar} color="gold" size="1x"/>
                                            <span className="rating-head"> {review.rating} </span>
                                            <span style={{color:'gray', fontSize: '0.8rem'}} className="rating-tail"> / 10 </span>
                                        </div>

                                        <div className="card-text">
                                            <p style={
                                                {
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    width: '100%',
                                                    height: '100%',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 10,
                                                    WebkitBoxOrient: 'vertical',

                                                }

                                            }
                                            >{review.text}</p>
                                        </div>

                                    </div>
                                </div>

                                    */}

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                {!scrollEnd && (
                    <div className="button" style={{right: '0', top: '0'}} onClick={() => slide(150)}>
                        <FontAwesomeIcon icon={faAngleRight} size="3x" color="#0070FF"/>
                    </div>
                )}



            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={open}
                onClick={handleClose}
            >
                <ExpandReview/>

            </Backdrop>
        </>
    )
}