import ky, { HTTPError } from "ky";
import { authed, url } from "@/lib/api/client";
import { Cast } from "@/lib/models/Cast";
import { InventoryProduct } from "@/lib/models/InventoryProduct";
import { Movie } from "@/lib/models/Movie";
import { Rating } from "@/lib/models/Rating";

/**
 * Body of movie_service's admin create/edit (MovieRequest.java). The IMDb id
 * (movieId) is only read on create.
 */
export interface MovieRequest {
    movieId?: string;
    title: string;
    year: number;
    rated: string | null;
    runtime: string | null;
    genres: string[];
    director: string | null;
    writer: string | null;
    boxOffice: string | null;
    revenue: number | null;
    production: string | null;
    plot: string | null;
    language: string | null;
    country: string | null;
    awards: string | null;
    poster: string | null;
    background: string | null;
    logo: string | null;
    cast: Cast[];
    ratings: Partial<Rating> | null;
}

/** POST /movie-service/admin/movie (ADMIN only). 409 if the IMDb id exists. */
export async function createMovie(token: string, body: MovieRequest): Promise<Movie> {
    return authed(token).post(url("movie", "admin/movie"), { json: body, retry: 0 }).json<Movie>();
}

/** PUT /movie-service/admin/movie/{id} (ADMIN only). */
export async function updateMovie(token: string, id: string, body: MovieRequest): Promise<Movie> {
    return authed(token).put(url("movie", `admin/movie/${encodeURIComponent(id)}`), { json: body, retry: 0 }).json<Movie>();
}

/** Put a movie on sale: POST /inventory-service/admin/product/. `id` is the movie's id, `sku` its IMDb id. */
export async function createProduct(
    token: string,
    product: { id: string; sku: string; price: number; quantity: number },
): Promise<InventoryProduct> {
    return authed(token).post(url("inventory", "admin/product/"), {
        json: { ...product, currency: "usd" },
        retry: 0,
    }).json<InventoryProduct>();
}

/**
 * Set price and/or stock: PUT /inventory-service/admin/product/. inventory
 * derives the status from the quantity and logs a stock change.
 */
export async function updateProduct(
    token: string,
    id: string,
    changes: { price?: number; quantity?: number },
): Promise<InventoryProduct> {
    return authed(token).put(url("inventory", "admin/product/"), { json: { id, ...changes } }).json<InventoryProduct>();
}

/** One row of GET /movie-service/cast/autocomplete (PersonSuggestion.java). */
export interface PersonSuggestion {
    id: string;
    name: string;
    photo: string | null;
    roles: string[];
    knownFor: string | null;
    films: number;
}

export async function searchPeople(text: string, signal?: AbortSignal): Promise<PersonSuggestion[]> {
    return ky.get(url("movie", "cast/autocomplete"), {
        searchParams: { q: text, limit: 8 },
        signal,
        retry: 0,
    }).json<PersonSuggestion[]>();
}

/**
 * The server's own words for a failed admin call when it sent any (movie
 * admin errors are {"message": ...}, inventory's {message, status}), else a
 * generic line.
 */
export async function errorMessage(error: unknown, fallback: string): Promise<string> {
    if (error instanceof HTTPError) {
        try {
            const body = await error.response.clone().json();
            if (typeof body?.message === "string" && body.message) return body.message;
        } catch {
            // Not JSON: fall through.
        }
        if (error.response.status === 403) return "Your account doesn’t have admin access.";
    }
    return fallback;
}
