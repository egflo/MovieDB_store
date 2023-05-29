import {Review} from "../models/Review";
import React, {DependencyList, EffectCallback, useEffect, useRef, useState} from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbDown from "@mui/icons-material/ThumbDown";
import {Backdrop} from "@mui/material";
import Divider from '@mui/material/Divider';
import {ToastType} from "./Toast";
import {auth, axiosInstance} from "../utils/firebase";
import useToastContext from "../hooks/useToastContext";
import {AxiosResponse} from "axios";
import {SentimentState} from "../models/SentimentState";
import StarIcon from '@mui/icons-material/Star';
import {ThumbDownAltOutlined, ThumbUpOffAltOutlined} from "@mui/icons-material";


const RATE_API : string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/sentiment/rate`


const useEffectAfterMount = (cb: EffectCallback, dependencies: DependencyList | undefined) => {
    const mounted = useRef(true);

    useEffect(() => {
        if (!mounted.current) {
            return cb();
        }
        mounted.current = false;
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

export default function ReviewCard({review}:{review: Review}) {
    const [state, setState] = useState(review.status ? review.status : SentimentState.NONE);
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const toast = useToastContext();
    const didMountRef = useRef(false);


    function handleCardClick(value: Review) {
        setOpenBackdrop(true);
    }

    function handleChange(value: SentimentState) {
        let user = auth.currentUser;
        if (user != null) {

            let uid = user.uid;
            user.getIdToken(true).then(function (idToken) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

                axiosInstance.post(RATE_API, {
                    objectId: review.id,
                    status: value,
                    userId: uid,
                    created: Date.now()
                }).then((response: AxiosResponse) => {
                    if (response.status === 200) {
                        toast.show("Review updated", ToastType.INFO);
                        setState(value)
                    } else {
                        toast.show("Error updating review", ToastType.ERROR);
                        setState(SentimentState.NONE)
                    }

                }).catch((error) => {
                    toast.show(error.response.data, ToastType.ERROR);
                    setState(SentimentState.NONE)
                });
            })
        }

        else {
            toast.show("You must be logged in to rate a review", ToastType.ERROR);
            setState(SentimentState.NONE);
        }
    }

    function handleClose() {
        setOpenBackdrop(false);
    }

    useEffectAfterMount(() => {
        //handleChange(state);
    } , [state]);


    return (
        <>
            <Card
                sx={{ minWidth: 275, maxWidth: 275, cursor: 'pointer' }}>
                <CardContent sx={{ height: 250}}  onClick={() => handleCardClick(review)}>
                    <Box>
                        <Typography variant="inherit"  className="text-md" component="div" sx={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: '100%',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',

                        }}>
                            {review.title}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', pt: 1, pb: 1, gap: 1}}>
                            <Typography color="text.secondary" variant="body2">
                                {review.user.firstname} {review.user.lastname}
                            </Typography>

                            <Box>
                                <StarIcon fontSize={'small'} sx={{ color: 'gold' }}/>
                                <span className="rating-head"> {review.rating} </span>
                                <span style={{fontSize: '0.8rem'}} className="rating-tail"> / 10 </span>
                            </Box>

                        </Box>

                    </Box>

                    <Typography variant="body2" component="div" style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        width: '100%',
                        display: '-webkit-box',
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {review.text}
                    </Typography>

                </CardContent>

                <Divider sx={{

                    borderColor: 'grey.500',
                }}/>

                <CardActions disableSpacing>
                    <IconButton aria-label="like"
                                className={"hover:bg-green-700 hover:border-gray-700 hover:shadow-lg"}
                                onClick={() => {
                                    if(state === SentimentState.LIKE) {
                                        handleChange(SentimentState.NONE);
                                    }
                                    else {
                                        handleChange(SentimentState.LIKE);
                                    }
                                }}
                    >
                        <ThumbUpOffAltOutlined
                            fontSize={"small"}
                            sx={{ color:
                                state === SentimentState.LIKE ? "green" : "white"
                        }}/>
                    </IconButton>
                    <IconButton
                        className={"hover:bg-red-700 hover:border-gray-700 hover:shadow-lg"}
                        aria-label="dislike"
                                onClick={() => {
                                    if(state === SentimentState.DISLIKE) {
                                        handleChange(SentimentState.NONE);
                                    }
                                    else {
                                        handleChange(SentimentState.DISLIKE);
                                    }
                                }}
                    >
                        <ThumbDownAltOutlined
                            fontSize={"small"}
                            sx={{
                                color: state === SentimentState.DISLIKE ? "red" : "white"
                            }}/>
                    </IconButton>
                </CardActions>
            </Card>

            <Backdrop
                sx={{zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBackdrop}
                onClick={handleClose}
            >
                <Card sx={{
                    width: '80vw',
                    height: '70vh',
                }}>
                    <CardContent>
                        <Typography variant="h5" className="card-title">{review.title}</Typography>

                        <div className="card-subtitle mb-2">
                            <Typography className="text-muted">
                                {review.user.firstname} {review.user.lastname}</Typography>

                            <StarIcon sx={{ color: 'gold' }}/>
                            <span className="rating-head"> {review.rating} </span>
                            <span style={{color:'gray', fontSize: '0.8rem'}} className="rating-tail"> / 10 </span>
                        </div>

                        <div className="card-text">
                            <Typography style={
                                {
                                    width: '100%',
                                    overflow: 'auto',
                                    textOverflow: 'ellipsis',
                                }

                            }
                            >{review.text}</Typography>
                        </div>

                    </CardContent>
                </Card>
            </Backdrop>

        </>
    )

}