import {Cast} from "./Cast";
import {Rating} from "./Rating";
import {Tag} from "./Tag";

export interface Movie {
    id: string;
    title: string;
    year: number;
    rated: string;
    runtime: string;
    genres: string[];
    director: string;
    writer: string;
    boxOffice: string;
    production: string;
    plot: string;
    language: string;
    country: string;
    awards: string;
    poster: string;
    background?: any;
    cast: Cast[];
    ratings: Rating;
    movieId: string;

    tags: Tag[];
}