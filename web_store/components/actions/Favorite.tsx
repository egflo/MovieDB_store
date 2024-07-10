import IconButton from "@mui/material/IconButton";
import Toast, {ToastState, ToastType, Alert} from "../Toast";
import {auth, axiosInstance} from "../../utils/firebase";
import useSWR, { useSWRConfig } from "swr"
import useToastContext from "../../hooks/useToastContext";
import Box from "@mui/material/Box";
import {Movie} from "../../models/Movie";
import useAuthContext from "../../hooks/useAuthContext";
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import {useEffect, useState} from "react";
import {useBookmarkContext} from "../../contexts/BookmarkContext";

let BOOKMARK_URL = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/bookmark/`
const BOOKMARKS = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/bookmarks/?sortBy=created`;

type FavoriteProps = {
    movie: Movie
    //Optional function to be called when a bookmark is added
    onBookmarkAdded?: (id: string) => void;
    onBookmarkRemoved?: (id: string) => void;
}
const fetcher = (url: string, token: string | null) =>
    axiosInstance.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);


export default function Favorite({movie, onBookmarkAdded, onBookmarkRemoved}: FavoriteProps) {
    const {addBookmark, removeBookmark, getBookmark, error} = useBookmarkContext();
    // @ts-ignore
    const [loading, setLoading] = useState(false);
    const toast = useToastContext();
    const auth = useAuthContext();

    const bookmark = getBookmark(movie.id);

    const handleSelected = async () => {
        if (!auth.user) {
            toast.show("You must be logged in to add to favorites", ToastType.ERROR);
            return;
        }
        setLoading(true);

        try {
            if (bookmark) {
                await removeBookmark(bookmark.id);
                if (onBookmarkRemoved) {
                    onBookmarkRemoved(bookmark.id);
                }
                toast.show('Removed from favorites', ToastType.SUCCESS);
            } else {
                await addBookmark(movie.id);
                if (onBookmarkAdded) {
                    onBookmarkAdded(movie.id);
                }
                toast.show('Added to favorites', ToastType.SUCCESS);
            }
        } catch (error) {
            toast.show('An error occurred while updating the bookmark', ToastType.ERROR);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            className="container__action flex flex-col justify-center items-center"
        >

            <IconButton
                disabled={loading || !auth.isAuthenticated}
                onClick={handleSelected}
                //Make opacity red using rgba
                className={"hover:bg-[rgb(239,68,68,0.5)] hover:text-red-500 hover:shadow-lg"}
                aria-label="add to favorites"
            >
                <FavoriteBorderOutlined  color={bookmark ? "error" : "inherit"} className={"size-6 md:size-6"} />
            </IconButton>
        </Box>

    );
}


