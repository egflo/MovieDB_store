import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import * as React from "react";
import {useEffect} from "react";
import Toast, {ToastState, ToastType, Alert} from "../Toast";
import {auth, axiosInstance} from "../../utils/firebase";
import {Bookmark} from "../../models/Bookmark";
import { useSWRConfig } from "swr"
import useToastContext from "../../hooks/useToastContext";
import Box from "@mui/material/Box";
import {Movie} from "../../models/Movie";


let BOOKMARKS = "movie-service/bookmark";

type FavoriteProps = {
    movie: Movie
    bookmark: Bookmark | null
    selected: boolean
}


export default function Favorite(props: FavoriteProps) {
    const { mutate } = useSWRConfig()
    const [bookmarked, setBookmarked] = React.useState<Bookmark | null>(props.bookmark);
    const [selected, setSelected] = React.useState(props.selected || false);
    const toast = useToastContext();

    async function handleSelected() {
        let user = auth.currentUser;
        if (user == null) {
            toast.show("You must be logged in to add to favorites", ToastType.ERROR);
            return;
        }

        let token = await user.getIdToken(false);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (bookmarked != null) {
            axiosInstance.delete(BOOKMARKS + "/" + bookmarked.id).then((response) => {
                if (response.status === 200) {
                    toast.show("Removed from favorites", ToastType.INFO);
                    setBookmarked(null);
                } else {
                    toast.show("Could not remove from favorites", ToastType.ERROR);
                }
            });
        }
        else {
            axiosInstance.post(BOOKMARKS + "/", {
                movieId: props.movie.id,
                userId: user.uid,
                created: new Date(),
            }).then((response) => {
                if (response.status === 200) {
                    const data = response.data;
                    setBookmarked(data.data)
                    setSelected(data.success);
                    toast.show(data.message, data.success ? ToastType.SUCCESS : ToastType.ERROR);
                } else {
                    toast.show(response.status.toString(), ToastType.ERROR);
                }
            });
        }
    }

    useEffect(() => {
        // If the selected state is already set, don't do anything
        if (bookmarked) {
            return;
        }
        // if user is not logged in, don't do anything
        let user = auth.currentUser;
        if (user == null) {
            return;
        }

        // Get the token
        //Check if the movie is already bookmarked
        axiosInstance.get(BOOKMARKS + "/movie/" + props.movie.id).then((response) => {
            if (response.status === 200) {
                const data = response.data;
                if (data.success) {
                    setBookmarked(data.data);
                    setSelected(data.success);
                }
            } else {
                setBookmarked(null);
            }
        });
    }, [auth.currentUser]);

    return (
        <Box
            className="container__action"
        >
            <IconButton
                onClick={handleSelected}
                sx={{
                    color: selected ? "red" : "white.500"
                }}
                aria-label="add to favorites"
                color={selected ? "primary" : "inherit"}
            >
                <FavoriteIcon/>
            </IconButton>
        </Box>

    )
}