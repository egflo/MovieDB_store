import {Review} from "../models/Review";
import React, {useEffect, useState} from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbDown from "@mui/icons-material/ThumbDown";
import {Backdrop} from "@mui/material";
import Divider from '@mui/material/Divider';
import {Alert, ToastState, ToastType} from "./Toast";
import Snackbar from "@mui/material/Snackbar";
import {auth, axiosInstance} from "../utils/firebase";
import useToastContext from "../hooks/useToastContext";
import {AxiosResponse} from "axios";

enum ReviewState {
    NONE = "none",
    LIKE = "like",
    DISLIKE = "dislike"
}

export default function ReviewCard({review}:{review: Review}) {
    const [reviewState, setReviewState] = useState(ReviewState.NONE);
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const toast = useToastContext();

    function handleCardClick(value: Review) {
        setOpenBackdrop(true);
    }

    function handleChange() {

        let user = auth.currentUser;
        if (user != null) {
            let uid = user.uid;
            user.getIdToken(true).then(function (idToken) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

                axiosInstance.post("movie-service/review/rate", {
                    objectId: review.id,
                    status: reviewState,
                    userId: uid,
                    created: Date.now()
                }).then((response: AxiosResponse) => {
                    if (response.status === 200) {
                        toast.show("Review updated", ToastType.INFO);
                    } else {
                        toast.show("Error updating review", ToastType.ERROR);
                    }

                }).catch((error) => {
                    toast.show(error.message, ToastType.ERROR);
                });
            })
        }

        else {
            toast.show("You must be logged in to rate a review", ToastType.ERROR);
            setReviewState(ReviewState.NONE);
        }
    }

    function handleClose() {
        setOpenBackdrop(false);
    }

    return (
        <>
            <Card sx={{ minWidth: 275 }}>
                <CardContent sx={{ height: 320}}  onClick={() => handleCardClick(review)}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{
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
                            <Typography color="text.secondary">
                                {review.user.firstname} {review.user.lastname}
                            </Typography>

                            <Box>
                                <FontAwesomeIcon icon={faStar} color="gold" size="1x"/>
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
                        WebkitLineClamp: 9,
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
                                onClick={() => {
                                    if (reviewState === ReviewState.LIKE) {
                                        setReviewState(ReviewState.NONE);
                                    } else {
                                        setReviewState(ReviewState.LIKE);
                                    }
                                    handleChange();
                                }}
                    >
                        <ThumbUp
                            sx={{ color:
                                reviewState === ReviewState.LIKE ? "green" : "grey.500"
                        }}/>
                    </IconButton>
                    <IconButton aria-label="dislike"
                                onClick={() => {
                                    if (reviewState === ReviewState.DISLIKE) {
                                        setReviewState(ReviewState.NONE);
                                    } else {
                                        setReviewState(ReviewState.DISLIKE);
                                    }
                                    handleChange();
                                }}
                    >
                        <ThumbDown
                            sx={{
                                color: reviewState === ReviewState.DISLIKE ? "red" : "grey.500"
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

                            <FontAwesomeIcon icon={faStar} color="gold" size="1x" />
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