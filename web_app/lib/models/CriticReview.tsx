/** One critic review from GET /movie-service/reviews/critic/{source}/movie/{id}. */
export interface CriticReview {
    id: string;
    source: 'rt' | 'metacritic';
    movieId: string;
    critic: string | null;
    publication: string | null;
    /** As the critic wrote it ("3.5/5", "B", "80"); many Rotten Tomatoes reviews have none. */
    score: string | null;
    /** 0-100. */
    scoreNormalized: number | null;
    sentiment: 'positive' | 'mixed' | 'negative' | null;
    /** Rotten Tomatoes only. */
    state: 'fresh' | 'rotten' | null;
    /** Rotten Tomatoes only. */
    topCritic: boolean | null;
    text: string | null;
    /** The full review; Rotten Tomatoes only, and not always. */
    url: string | null;
    /** Missing on about half of Metacritic's. */
    date: string | null;
}
