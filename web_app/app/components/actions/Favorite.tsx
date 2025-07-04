import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import {useEffect, useState} from "react";
import {useAuth} from "@/lib/firebase/AuthContext";
import ky, {HTTPError} from "ky";
import {Bookmark} from "@/lib/models/Bookmark";

const BOOKMARK_API : string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/bookmark/`;

type FavoriteProps = {
    id: string
    //Optional function to be called when a bookmark is added
    onBookmarkAdded?: (id: string) => void;
    onBookmarkRemoved?: (id: string) => void;
}

export default function Favorite({id, onBookmarkAdded, onBookmarkRemoved}: FavoriteProps) {
    const auth = useAuth();
    const [bookmark, setBookmark] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBookmark = async () => {
            if (!auth.user) return;
            const response = await ky(`${BOOKMARK_API}${id}`, {
                headers: {
                    "Authorization": `Bearer ${auth.user.idToken}`
                }
            }).json()

            if (response) {
                setBookmark(response);
            } else {
                console.error('Failed to fetch bookmark');
            }
        };

        fetchBookmark();
    }, [id, auth.user]);

    const handleSelected = async () => {
        setLoading(true);
        // Check if the user is authenticated
        if (!auth.user) {
            console.error('User is not authenticated');
            return;
        }

        const body = {
            movieId: id,
            userId: auth.user?.uid,
        };

        try {
            const response = await fetch(BOOKMARK_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.user.idToken}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setBookmark(!bookmark);
                if (bookmark && onBookmarkRemoved) {
                    onBookmarkRemoved(id);
                } else if (!bookmark && onBookmarkAdded) {
                    onBookmarkAdded(id);
                }
            } else {
                console.error('Failed to update bookmark');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className=" flex  items-center justify-center gap-1 rounded-full   bg-gray-900  hover:border-gray-800 hover:shadow-lg cursor-pointer">
            <IconButton
                disabled={loading}
                onClick={handleSelected}
                sx={{
                    "&:hover": {
                        backgroundColor: "rgba(100,100,100,0.4)",
                    }
                }}
                className={"hover:bg-[rgb(239,68,68,0.5)] hover:text-red-500 hover:shadow-lg"}
                aria-label="add to favorites"
            >
                <FavoriteBorderOutlined
                    sx = {{color: bookmark ? 'red' : 'white'}}
                    className={"size-6 md:size-6"} />
            </IconButton>
        </div>

    );
}


