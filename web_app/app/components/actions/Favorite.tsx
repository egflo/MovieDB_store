'use client';

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useBookmarks } from "@/lib/context/BookmarkContext";

type FavoriteProps = {
    id: string;
    onBookmarkAdded?: (id: string) => void;
    onBookmarkRemoved?: (id: string) => void;
};

export default function Favorite({
    id,
    onBookmarkAdded,
    onBookmarkRemoved,
}: FavoriteProps) {
    const { user } = useAuth();
    const { getByMovie, add, removeByMovie } = useBookmarks();
    const [pending, setPending] = useState(false);

    const bookmarked = Boolean(getByMovie(id));

    async function toggle() {
        if (!user || pending) return;
        setPending(true);
        try {
            if (bookmarked) {
                // Previously this only flipped local state, so un-favouriting
                // never reached the server.
                await removeByMovie(id);
                onBookmarkRemoved?.(id);
            } else {
                await add(id);
                onBookmarkAdded?.(id);
            }
        } catch (e) {
            console.error("Failed to update bookmark", e);
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="flex items-center justify-center gap-1 rounded-full bg-gray-900 hover:border-gray-800 hover:shadow-lg cursor-pointer">
            <IconButton
                disabled={pending || !user}
                onClick={toggle}
                sx={{ "&:hover": { backgroundColor: "rgba(100,100,100,0.4)" } }}
                className="hover:bg-[rgb(239,68,68,0.5)] hover:text-red-500 hover:shadow-lg"
                aria-label={bookmarked ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={bookmarked}
            >
                <FavoriteBorderOutlined
                    sx={{ color: bookmarked ? "red" : "white" }}
                    className="size-6 md:size-6"
                />
            </IconButton>
        </div>
    );
}
