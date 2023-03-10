import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import * as React from "react";
import {useEffect} from "react";
import Toast, {ToastState, ToastType, Alert} from "../Toast";
import Snackbar from "@mui/material/Snackbar";
import StarIcon from "@mui/icons-material/Star";
import Card from "@mui/material/Card";
import {Backdrop, CardHeader} from "@mui/material";
import Rating from '@mui/material/Rating';
import CardContent from "@mui/material/CardContent";
import ClickAwayListener from
        "@mui/material/ClickAwayListener";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbDown from "@mui/icons-material/ThumbDown";
import {Favorite} from "@mui/icons-material";
import {auth, axiosInstance} from "../../utils/firebase";
import useToastContext from "../../hooks/useToastContext";
import {AxiosResponse} from "axios/index";
import {useRef} from "react";
import {Movie} from "../../models/Movie";

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
    const [value, setValue] = React.useState<RateType | null>(RateType.LIKE);
    const [selected, setSelected] = React.useState(false);
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
        setValue(type)
        let user = auth.currentUser;
        if (user != null) {
            let uid = user.uid;
            user.getIdToken(true).then(function (idToken) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

                axiosInstance.post("movie-service/movie/rate", {
                    objectId: props.movie.id,
                    status: type,
                    userId: uid,
                    created: Date.now()
                }).then((response: AxiosResponse) => {
                    if (response.status === 200) {
                        toast.show("Rating Updated", ToastType.INFO);
                    } else {
                        toast.show("Error updating rating", ToastType.ERROR);
                    }

                }).catch((error) => {
                    toast.show(error.message, ToastType.ERROR);
                });
            })
        }
        else {
            toast.show("Please login to rate this film", ToastType.ERROR);
        }
        setSelected(false);
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
                    <StarIcon/>
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
                                    flexDirection: 'column'
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