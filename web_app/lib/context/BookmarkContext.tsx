'use client';

import React, { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { Bookmark } from "@/lib/models/Bookmark";
import { useAuth } from "@/lib/firebase/AuthContext";
import {
    getBookmarks,
    addBookmark as apiAdd,
    removeBookmarkByMovie as apiRemoveByMovie,
} from "@/lib/api/bookmarks";

interface BookmarkContextValue {
    bookmarks: Bookmark[];
    loading: boolean;
    error: unknown;
    /** The bookmark for a movie, or null if it isn't bookmarked. */
    getByMovie: (movieId: string) => Bookmark | null;
    add: (movieId: string) => Promise<void>;
    removeByMovie: (movieId: string) => Promise<void>;
    refresh: () => Promise<unknown>;
}

const BookmarkContext = createContext<BookmarkContextValue | undefined>(undefined);

export const BOOKMARKS_KEY = "bookmarks";

export function BookmarkProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const { data, error, isLoading, mutate } = useSWR(
        user ? [BOOKMARKS_KEY, user.idToken] : null,
        ([, token]) => getBookmarks(token),
        { revalidateOnFocus: false },
    );

    const bookmarks = data ?? [];

    async function add(movieId: string) {
        if (!user) return;
        await apiAdd(user.idToken, movieId, user.uid);
        await mutate();
    }

    async function removeByMovie(movieId: string) {
        if (!user) return;
        await apiRemoveByMovie(user.idToken, movieId);
        await mutate();
    }

    return (
        <BookmarkContext.Provider
            value={{
                bookmarks,
                loading: Boolean(user) && isLoading,
                error,
                getByMovie: (movieId) =>
                    bookmarks.find((b) => b.movie?.id === movieId) ?? null,
                add,
                removeByMovie,
                refresh: () => mutate(),
            }}
        >
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error("useBookmarks must be used within a BookmarkProvider");
    }
    return context;
}
