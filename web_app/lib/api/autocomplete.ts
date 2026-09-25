import ky from "ky";
import { url } from "./client";
import { Rating } from "@/lib/models/Rating";

/** A row of GET /movie/autocomplete (movie_service's MovieSuggestion). */
export interface MovieSuggestion {
    /** Mongo id; /movie/{id} takes it. */
    id: string;
    movieId: string;
    title: string;
    year: number | null;
    /** null when the movie has none. */
    poster: string | null;
    /** Just the fields pickScore reads; null when the movie has no ratings. */
    ratings: Pick<Rating, "rating" | "imdb" | "rottenTomatoes" | "rottenTomatoesStatus" | "metacritic"> | null;
}

/** A row of GET /cast/autocomplete (movie_service's PersonSuggestion). */
export interface PersonSuggestion {
    /** The cast id (nm...); /cast/{id} takes it. */
    id: string;
    name: string;
    photo: string | null;
    /** Credit categories, e.g. ["actor", "director"]. */
    roles: string[];
    /** Their most-voted film in the store. */
    knownFor: string;
    films: number;
}

/**
 * Public endpoints (no token), ranked by how the text matches: start of the
 * title or name first, then the start of a word, then anywhere. Case- and
 * accent-insensitive. Blank text gives []. No retries: a newer keystroke
 * replaces the request anyway, and `signal` cancels it.
 */
const publicApi = ky.create({ retry: 0, timeout: 8000 });

export function suggestMovies(text: string, { limit, signal }: { limit?: number; signal?: AbortSignal } = {}) {
    const searchParams: Record<string, string | number> = { q: text };
    if (limit) searchParams.limit = limit;
    return publicApi.get(url("movie", "movie/autocomplete"), { searchParams, signal }).json<MovieSuggestion[]>();
}

export function suggestPeople(text: string, { limit, signal }: { limit?: number; signal?: AbortSignal } = {}) {
    const searchParams: Record<string, string | number> = { q: text };
    if (limit) searchParams.limit = limit;
    return publicApi.get(url("movie", "cast/autocomplete"), { searchParams, signal }).json<PersonSuggestion[]>();
}
