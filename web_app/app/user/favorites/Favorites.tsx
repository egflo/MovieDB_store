'use client';

import React from "react";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useBookmarks } from "@/lib/context/BookmarkContext";
import PosterItem from "@/app/ui/PosterItem";

export default function Favorites() {
    const { user } = useAuth();
    const { bookmarks, loading, error } = useBookmarks();

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to see your favorites.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-red-500">Failed to load your favorites.</div>;
    }

    if (bookmarks.length === 0) {
        return (
            <div className="flex flex-col gap-3 p-6">
                <h1 className="text-xl font-medium">No favorites yet</h1>
                <p className="text-gray-500">
                    Tap the heart on any movie to save it here.
                </p>
                <Link href="/" className="underline">
                    Browse movies
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-xl font-medium">
                Favorites ({bookmarks.length})
            </h1>

            <div className="flex flex-row flex-wrap gap-4">
                {bookmarks
                    .filter((b) => b.movie)
                    .map((b) => (
                        <PosterItem key={b.id} item={b.movie} size="small" />
                    ))}
            </div>
        </div>
    );
}
