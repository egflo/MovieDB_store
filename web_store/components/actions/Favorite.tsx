import IconButton from "@mui/material/IconButton";
import Toast, {ToastState, ToastType, Alert} from "../Toast";
import {auth, axiosInstance} from "../../utils/firebase";
import {Bookmark} from "../../models/Bookmark";
import { useSWRConfig } from "swr"
import useToastContext from "../../hooks/useToastContext";
import Box from "@mui/material/Box";
import {Movie} from "../../models/Movie";
import useAuthContext from "../../hooks/useAuthContext";
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import {useState} from "react";

let BOOKMARK_URL = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/bookmark/`

type FavoriteProps = {
    movie: Movie
}
export default function Favorite({movie}: FavoriteProps) {
    // @ts-ignore
    const [bookmarked, setBookmarked] = useState<Bookmark | null>(movie.bookmark);
    const [loading, setLoading] = useState(false);
    const toast = useToastContext();
    const auth = useAuthContext();
    const { mutate } = useSWRConfig()

    async function handleSelected() {

        if (!auth.isAuthenticated) {
            toast.show("You must be logged in to add to favorites", ToastType.ERROR);
            return;
        }

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

        if (bookmarked) {
            const DELETE_BOOKMARK = `${BOOKMARK_URL}${bookmarked.id}`
            axiosInstance.delete(DELETE_BOOKMARK).then((response) => {
                if (response.status < 300) {
                    setBookmarked(null);
                    toast.show("Removed from favorites", ToastType.INFO);
                } else {
                    toast.show("Could not remove from favorites", ToastType.ERROR);
                }
            }).catch((error) => {
                toast.show(error.message, ToastType.ERROR);
            } );
        }
        else {

            axiosInstance.post(BOOKMARK_URL, {
                movieId: movie.id,
                userId: auth.user?.uid,
                created: new Date(),
            }).then((response) => {
                if (response.status === 200) {
                    setBookmarked(response.data);
                    toast.show("Added to favorites", ToastType.INFO);
                } else {
                    toast.show(response.data, ToastType.ERROR);
                }
            }).catch((error) => {
                toast.show(error.message, ToastType.ERROR);
            } );
        }
    }

    return (
        <Box
            className="container__action"
        >

            <IconButton
                disabled={loading}
                onClick={handleSelected}
                sx={{
                    color: bookmarked ? "red" : "black.500"
                }}
                aria-label="add to favorites"
                color={bookmarked ? "primary" : "inherit"}
            >
                <FavoriteBorderOutlined/>
            </IconButton>
        </Box>

    );
}