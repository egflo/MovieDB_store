import { MovieRequest } from "@/lib/api/admin/movies";
import { Movie } from "@/lib/models/Movie";
import { Rating } from "@/lib/models/Rating";

/**
 * Form state for adding or editing a movie. Plain module (no 'use client'):
 * the conversions and checks are pure, so they can be tested alone.
 * Numbers are kept as strings while typing; toRequest converts them.
 */

/** The 25 genres in the data (db.movies.distinct("genres"), 2026-09-26). */
export const GENRES = [
    "Action", "Adult", "Adventure", "Animation", "Biography", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "Film-Noir", "History", "Horror",
    "Music", "Musical", "Mystery", "News", "Reality-TV", "Romance", "Sci-Fi",
    "Sport", "Thriller", "War", "Western",
];

/** Credit categories in the data (lower case; a few old records say "Actor" or null). */
export const CAST_CATEGORIES = [
    "actor", "actress", "director", "writer", "producer", "composer",
    "cinematographer", "editor", "production_designer", "self",
    "archive_footage", "archive_sound",
];

/** Suggestions only: the data holds dozens of rating systems. */
export const RATED_SUGGESTIONS = ["G", "PG", "PG-13", "R", "NC-17", "Not Rated", "Unrated", "TV-MA", "TV-14", "TV-PG"];

export const RT_CRITIC_STATUSES = ["Certified-Fresh", "Fresh", "Rotten"];
export const RT_AUDIENCE_STATUSES = ["Upright", "Spilled"];

export interface CastRow {
    /** React key only; not sent. */
    key: string;
    id: string;
    name: string;
    category: string;
    /** Comma-separated while editing. */
    characters: string;
    photo: string;
}

export interface MovieFormState {
    movieId: string;
    title: string;
    year: string;
    rated: string;
    runtime: string;
    genres: string[];
    director: string;
    writer: string;
    production: string;
    plot: string;
    language: string;
    country: string;
    awards: string;
    boxOffice: string;
    revenue: string;
    poster: string;
    background: string;
    logo: string;
    rating: string;
    numOfVotes: string;
    metacritic: string;
    rottenTomatoes: string;
    rottenTomatoesStatus: string;
    rottenTomatoesAudience: string;
    rottenTomatoesAudienceStatus: string;
    cast: CastRow[];
}

export type FormErrors = Partial<Record<keyof MovieFormState | `cast.${number}`, string>>;

let nextKey = 0;
export function castKey(): string {
    return `cast-${nextKey++}`;
}

export function emptyForm(): MovieFormState {
    return {
        movieId: "", title: "", year: "", rated: "", runtime: "", genres: [],
        director: "", writer: "", production: "", plot: "", language: "", country: "",
        awards: "", boxOffice: "", revenue: "", poster: "", background: "", logo: "",
        rating: "", numOfVotes: "", metacritic: "", rottenTomatoes: "", rottenTomatoesStatus: "",
        rottenTomatoesAudience: "", rottenTomatoesAudienceStatus: "", cast: [],
    };
}

/** 0 means "missing" in this data, so it shows as an empty box. */
function num(value: number | null | undefined): string {
    return value == null || value === 0 ? "" : String(value);
}

function text(value: string | null | undefined): string {
    // The data uses "N/A" for missing text and images.
    return value == null || value === "N/A" ? "" : value;
}

export function formFromMovie(movie: Movie): MovieFormState {
    const r = movie.ratings ?? ({} as Partial<Rating>);
    return {
        movieId: movie.movieId ?? "",
        title: text(movie.title),
        year: movie.year ? String(movie.year) : "",
        rated: text(movie.rated),
        runtime: text(movie.runtime),
        genres: movie.genres ?? [],
        director: text(movie.director),
        writer: text(movie.writer),
        production: text(movie.production),
        plot: text(movie.plot),
        language: text(movie.language),
        country: text(movie.country),
        awards: text(movie.awards),
        boxOffice: text(movie.boxOffice),
        revenue: num(movie.revenue),
        poster: text(movie.poster),
        background: text(movie.background),
        logo: text(movie.logo),
        rating: num(r.rating),
        numOfVotes: num(r.numOfVotes),
        metacritic: num(r.metacritic),
        rottenTomatoes: num(r.rottenTomatoes),
        rottenTomatoesStatus: text(r.rottenTomatoesStatus),
        rottenTomatoesAudience: num(r.rottenTomatoesAudience),
        rottenTomatoesAudienceStatus: text(r.rottenTomatoesAudienceStatus),
        cast: (movie.cast ?? []).map((c) => ({
            key: castKey(),
            id: c.id ?? "",
            name: c.name ?? "",
            category: c.category ?? "",
            characters: (c.characters ?? []).join(", "),
            photo: text(c.photo),
        })),
    };
}

const IMDB_TITLE_ID = /^tt\d{7,10}$/;
const IMDB_NAME_ID = /^nm\d{7,10}$/;
const WEB_URL = /^https?:\/\/\S+$/;
const DECIMAL = /^\d+(\.\d+)?$/;

function checkNumber(errors: FormErrors, field: keyof MovieFormState, value: string, max: number, label: string) {
    const v = value.trim();
    if (!v) return;
    if (!DECIMAL.test(v) || Number(v) > max) errors[field] = `${label}: 0 to ${max}`;
}

/** Mirrors MovieAdminService's checks, so most mistakes are caught before saving. */
export function validate(state: MovieFormState, mode: "create" | "edit"): FormErrors {
    const errors: FormErrors = {};
    if (mode === "create" && !IMDB_TITLE_ID.test(state.movieId.trim())) {
        errors.movieId = "Like tt0468569";
    }
    if (!state.title.trim()) errors.title = "Required";

    const maxYear = new Date().getFullYear() + 5;
    const year = Number(state.year.trim());
    if (!/^\d{4}$/.test(state.year.trim()) || year < 1874 || year > maxYear) {
        errors.year = `1874 to ${maxYear}`;
    }
    if (state.revenue.trim() && !/^\d+$/.test(state.revenue.trim())) errors.revenue = "Whole dollars, e.g. 1004558444";

    for (const field of ["poster", "background", "logo"] as const) {
        if (state[field].trim() && !WEB_URL.test(state[field].trim())) errors[field] = "An http(s) URL";
    }

    checkNumber(errors, "rating", state.rating, 10, "IMDb rating");
    checkNumber(errors, "metacritic", state.metacritic, 100, "Metacritic");
    checkNumber(errors, "rottenTomatoes", state.rottenTomatoes, 100, "Critics");
    checkNumber(errors, "rottenTomatoesAudience", state.rottenTomatoesAudience, 100, "Audience");
    if (state.numOfVotes.trim() && !/^\d+$/.test(state.numOfVotes.trim())) errors.numOfVotes = "A whole number";

    state.cast.forEach((row, i) => {
        if (!row.name.trim()) errors[`cast.${i}`] = "Name required";
        else if (row.id.trim() && !IMDB_NAME_ID.test(row.id.trim())) errors[`cast.${i}`] = "IMDb id like nm0000123";
    });
    return errors;
}

function orNull(value: string): string | null {
    const v = value.trim();
    return v ? v : null;
}

function numOrNull(value: string): number | null {
    const v = value.trim();
    return v ? Number(v) : null;
}

/**
 * The request body. `base` is the movie being edited: rating fields the form
 * doesn't show (ratings.imdb) are carried over from it unchanged.
 */
export function toRequest(state: MovieFormState, base?: Movie | null): MovieRequest {
    return {
        movieId: state.movieId.trim() || undefined,
        title: state.title.trim(),
        year: Number(state.year.trim()),
        rated: orNull(state.rated),
        runtime: orNull(state.runtime),
        genres: state.genres,
        director: orNull(state.director),
        writer: orNull(state.writer),
        production: orNull(state.production),
        plot: orNull(state.plot),
        language: orNull(state.language),
        country: orNull(state.country),
        awards: orNull(state.awards),
        boxOffice: orNull(state.boxOffice),
        revenue: numOrNull(state.revenue),
        poster: orNull(state.poster),
        background: orNull(state.background),
        logo: orNull(state.logo),
        ratings: {
            ...(base?.ratings ?? {}),
            rating: numOrNull(state.rating) ?? undefined,
            numOfVotes: numOrNull(state.numOfVotes) ?? undefined,
            metacritic: numOrNull(state.metacritic) ?? undefined,
            rottenTomatoes: numOrNull(state.rottenTomatoes) ?? undefined,
            rottenTomatoesStatus: orNull(state.rottenTomatoesStatus) ?? undefined,
            rottenTomatoesAudience: numOrNull(state.rottenTomatoesAudience) ?? undefined,
            rottenTomatoesAudienceStatus: orNull(state.rottenTomatoesAudienceStatus) ?? undefined,
        },
        cast: state.cast.map((row) => ({
            id: row.id.trim(),
            name: row.name.trim(),
            category: row.category || null,
            characters: row.characters.split(",").map((c) => c.trim()).filter(Boolean),
            photo: row.photo.trim(),
        })),
    };
}

/** For "unsaved changes": compares what would be sent. */
export function sameRequest(a: MovieFormState, b: MovieFormState): boolean {
    return JSON.stringify(toRequest(a)) === JSON.stringify(toRequest(b));
}
