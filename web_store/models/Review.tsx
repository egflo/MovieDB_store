import {User} from "./User";

export interface Review {
    id: string;
    movieId: string;
    rating: number;
    sentiment: string;
    title: string;
    text: string;
    user: User;
    date: string;
}