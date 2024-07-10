import IconButton from "@mui/material/IconButton";
import React, {useEffect, useState} from "react";
import Toast, {ToastState, ToastType, Alert} from "../Toast";
import Card from "@mui/material/Card";
import {Backdrop, CardHeader} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbDown from "@mui/icons-material/ThumbDown";
import {
    Favorite,
} from "@mui/icons-material";
import {auth, axiosInstance} from "../../utils/firebase";
import useToastContext from "../../hooks/useToastContext";
import {useRef} from "react";
import {Movie} from "../../models/Movie";
import {SentimentState} from "../../models/SentimentState";
import {RateType} from "../../models/RateType";

const RATE_API : string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/sentiment/rate`

type RateProps = {
    movie: Movie;
    children?: React.ReactNode
}

export default function Rate({ movie, children }: RateProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = React.useState(false);
    const [rate, setRate] = React.useState(movie.sentiment?.status || SentimentState.NONE);
    let toast = useToastContext();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setSelected(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);


    const handleSelected = async (type: RateType) => {
        const user = auth.currentUser;
        if (user) {
            const idToken = await user.getIdToken(true);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

            const data = {
                objectId: movie.id,
                status: type,
                userId: user.uid,
                created: Date.now()
            };

            try {
                const response = await axiosInstance.post(RATE_API, data);
                if (response.status < 300) {
                    // @ts-ignore
                    setRate(type);
                    toast.show("Rating Updated", ToastType.INFO);
                } else {
                    toast.show("Error updating rating", ToastType.ERROR);
                }
            } catch (error) {
                // @ts-ignore
                toast.show(error.response.data, ToastType.ERROR);
            }
        } else {
            toast.show("Please login to rate this film", ToastType.ERROR);
        }
        setSelected(false);
    }


    const contextValue = {
        rate,
        selected,
        setSelected,
        handleSelected
    };

    return (
        <RateContext.Provider value={contextValue}>
            {children}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={selected}
            >
                <Card ref={ref} sx={{ zIndex: (theme) => theme.zIndex.drawer + 2, minWidth: 250 }}>
                    <CardHeader
                        title={movie.title}
                        subheader="Please rate this film"
                    />
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            <IconButton onClick={() => handleSelected(RateType.DISLIKE)}>
                                <Box>
                                    <ThumbDown />
                                    <Typography variant="body2" color="text.secondary">Dislike it</Typography>
                                </Box>
                            </IconButton>
                            <IconButton onClick={() => handleSelected(RateType.LIKE)}>
                                <Box>
                                    <ThumbUp />
                                    <Typography variant="body2" color="text.secondary">Like it</Typography>
                                </Box>
                            </IconButton>
                            <IconButton onClick={() => handleSelected(RateType.LOVE)}>
                                <Box>
                                    <Favorite />
                                    <Typography variant="body2" color="text.secondary">Love it</Typography>
                                </Box>
                            </IconButton>
                        </Box>
                    </CardContent>
                </Card>
            </Backdrop>
        </RateContext.Provider>

    )
}

const RateContext = React.createContext({
    rate: SentimentState.NONE,
    selected: false,
    setSelected: (selected: boolean) => {},
    handleSelected: (type: RateType) => {}
});

export const useRateContext = () => React.useContext(RateContext);