import {User} from "./User";
import {SentimentState} from "./SentimentState";
import {Movie} from "@/lib/models/Movie";
import {Sentiment} from "@/lib/models/Sentiment";

export interface Review {
    id: string;
    movieId: string;
    rating: number;
    title: string;
    content: string;
    user: User;
    movie: Movie;
    date: string;
    love: boolean;
    likes: number;
    dislikes: number;
    sentiment: Sentiment;
}