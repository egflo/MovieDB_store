import {User} from "./User";
import {SentimentState} from "./SentimentState";

export interface Review {
    id: string;
    movieId: string;
    rating: number;
    sentiment: string;
    title: string;
    text: string;
    user: User;
    date: string;
    status: SentimentState;
}