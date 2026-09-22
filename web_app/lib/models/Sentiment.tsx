import {SentimentState} from "./SentimentState";


export interface Sentiment {
    id: string;
    objectId: string;
    userId: string;
    status: SentimentState;
    created: string;
}