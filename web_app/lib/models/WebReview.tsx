/**
 * One user review collected from another site, from
 * GET /movie-service/reviews/user/{source}/movie/{id}. The store's own
 * reviews are `Review` (user_service).
 */
export interface WebReview {
    id: string;
    source: 'imdb' | 'letterboxd' | 'metacritic';
    movieId: string;
    /** IMDb only. */
    title: string | null;
    text: string | null;
    /** Out of 10 for every source. */
    rating: number | null;
    sentiment: 'positive' | 'negative' | null;
    /** Letterboxd likes or IMDb "found helpful" votes. */
    likes: number | null;
    /** Letterboxd only: the reviewer gave the film a heart. */
    liked: boolean | null;
    /** The review on its site; IMDb only. */
    url: string | null;
    date: string | null;
    user: {
        id: string | null;
        name: string | null;
        avatar: string | null;
        profile: string | null;
    } | null;
}

/** GET /movie-service/reviews/movie/{id}/counts: reviews per source. */
export interface ReviewCounts {
    critic: { rt: number; metacritic: number };
    user: { imdb: number; letterboxd: number; metacritic: number };
}
