import IconButton from "@mui/material/IconButton";
import React, {useEffect} from "react";
import Toast, {ToastState, ToastType, Alert} from "../Toast";
import Card from "@mui/material/Card";
import {Backdrop, CardHeader} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbDown from "@mui/icons-material/ThumbDown";
import {Favorite, StarOutlined, StarOutlineOutlined, ThumbUpOffAltOutlined} from "@mui/icons-material";
import {auth, axiosInstance} from "../../utils/firebase";
import useToastContext from "../../hooks/useToastContext";
import {AxiosResponse} from "axios/index";
import {useRef} from "react";
import {Movie} from "../../models/Movie";
import {SentimentState} from "../../models/SentimentState";



const RATE_API : string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/sentiment/rate`


enum RateType {
    LIKE = "like",
    DISLIKE = "dislike",
    LOVE = "love",
}

type RateProps = {
    movie: Movie;
}


export default function Rate(props: RateProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = React.useState(false);
    const [rate, setRate] = React.useState(props.movie.sentiment?.status || SentimentState.NONE);
    let toast = useToastContext();

    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        // @ts-ignore
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setSelected(false);
            }
        }

        // Bind the event listener
        // @ts-ignore
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            // @ts-ignore
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);


    function handleSelected(type: RateType) {
        let user = auth.currentUser;
        if (user != null) {
            let uid = user.uid;
            user.getIdToken(true).then(function (idToken) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

                axiosInstance.post(RATE_API, {
                    objectId: props.movie.id,
                    status: type,
                    userId: uid,
                    created: Date.now()
                }).then((response: AxiosResponse) => {
                    if (response.status < 300) {
                        toast.show("Rating Updated", ToastType.INFO);
                    } else {
                        toast.show("Error updating rating", ToastType.ERROR);
                    }

                }).catch((error) => {
                    toast.show(error.response.data, ToastType.ERROR);
                });
            })

        }
        else {
            toast.show("Please login to rate this film", ToastType.ERROR);
        }
        setSelected(false);
    }


    const rateIcon = () => {
        switch (rate) {
            case "LIKE":
                return <ThumbUp/>;
            case "DISLIKE":
                return <ThumbDown/>;
            case "LOVE":
                return <Favorite/>;
            default:
                return <ThumbUpOffAltOutlined/>;
        }
    }
    return (
        <>
            <Box className="container__action">
                <IconButton
                    style={{zIndex: 99}}
                    onClick={() => setSelected(!selected)}
                    aria-label="rate"
                    color={selected ? "primary" : "inherit"}
                >
                    {rateIcon()}
                </IconButton>
            </Box>


            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={selected}
            >
                    <Card ref={ref} sx={{zIndex: (theme) => theme.zIndex.drawer + 2, minWidth: 250}} onClick={()=>
                        console.log("click")
                    }>
                        <CardHeader
                            title={props.movie.title}
                            subheader="Please rate this film"
                        />
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row'
                                }}
                            >
                                <IconButton
                                    onClick={() => handleSelected(RateType.DISLIKE)}
                                >
                                    <Box>
                                        <ThumbDown
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Dislike it
                                        </Typography>
                                    </Box>

                                </IconButton>

                                <IconButton
                                    onClick={() => handleSelected(RateType.LIKE)}
                                >
                                    <Box>
                                        <ThumbUp/>
                                        <Typography variant="body2" color="text.secondary">
                                            Like it
                                        </Typography>
                                    </Box>
                                </IconButton>

                                <IconButton
                                    onClick={() => handleSelected(RateType.LOVE)}
                                >
                                    <Box>
                                        <Favorite/>
                                        <Typography variant="body2" color="text.secondary">
                                            Love it
                                        </Typography>
                                    </Box>
                                </IconButton>

                            </Box>
                        </CardContent>
                    </Card>

            </Backdrop>


        </>

    )
}