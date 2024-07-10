import {User} from "./User";
import {SentimentState} from "./SentimentState";

export interface CriticReview {
    id: string;
    creation_date: string;
    critic_name: string;
    isTopCritic: boolean;
    movieId: string;
    publication_name: string;
    review_id: number
    review_state: string;
    review_url: string;
    text: string;
    score: string;
    sentiment: string;
    topCritic: boolean;
}