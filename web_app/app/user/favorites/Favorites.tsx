'use client';

import React, {useState} from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useBookmarks } from "@/lib/context/BookmarkContext";
import {MOVIE_GRID, MovieCard, MovieGridSkeleton} from "@/app/ui/MovieCard";
import SignInDialog from "@/app/components/SignInDialog";
import {CHIP} from "@/app/ui/chip";

/**
 * The signed-in user's favourites, in the same cards and grid as search
 * results. Un-hearting a card removes it here straight away, since the grid
 * reads the shared bookmark list. The stored movie details have no ratings, so
 * these cards show no score.
 */
export default function Favorites() {
    const { user } = useAuth();
    const { bookmarks, loading, error } = useBookmarks();
    const [signInOpen, setSignInOpen] = useState(false);

    const movies = bookmarks
        .filter((b) => b.movie)
        // Most recently added first.
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
        .map((b) => b.movie);

    let body: React.ReactNode;
    if (!user) {
        body = (
            <div className="flex flex-col items-start gap-3 py-10">
                <p className="text-white/70">Sign in to see the movies you’ve saved.</p>
                <button type="button" onClick={() => setSignInOpen(true)} className={`${CHIP} cursor-pointer px-4`}>
                    Sign in
                </button>
                <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
            </div>
        );
    } else if (loading) {
        body = <MovieGridSkeleton count={8} label="Loading favorites" />;
    } else if (error) {
        body = <p className="py-10 text-white/60">Couldn’t load your favorites. Try again in a moment.</p>;
    } else if (movies.length === 0) {
        body = (
            <div className="flex flex-col items-start gap-3 py-10">
                <p className="text-white/70">No favorites yet. Tap the heart on any movie to save it here.</p>
                <Link href="/search" className={`${CHIP} px-4`}>Browse movies</Link>
            </div>
        );
    } else {
        body = (
            <ul className={MOVIE_GRID}>
                {movies.map((movie) => <li key={movie.id}><MovieCard movie={movie} /></li>)}
            </ul>
        );
    }

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-8 text-white">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
                <p className="h-5 text-sm text-white/60">
                    {user && !loading && !error && `${movies.length} ${movies.length === 1 ? 'movie' : 'movies'}`}
                </p>
            </header>
            {body}
        </main>
    );
}
