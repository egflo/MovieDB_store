import {Movie} from "./Movie";

export interface Bookmark {
    id: string;
    movie: Movie;
    userId: string;
    created: string
}