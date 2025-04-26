import {User} from "./User";
import {SentimentState} from "./SentimentState";

export interface Review {
    id: string;
    movieId: string;
    rating: number;
    sentiment: string;
    title: string;
    content: string;
    user: User;
    date: string;
    love: boolean;
    likes: number;
    dislikes: number;
    status: SentimentState;
}