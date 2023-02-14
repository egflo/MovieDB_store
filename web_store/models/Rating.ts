export interface Rating {
    rating: number;
    numOfVotes: number;
    metacritic?: number;
    imdb?: number;
    rottenTomatoes?: number;
    rottenTomatoesAudience?: number;
    rottenTomatoesAudienceStatus?: string;

    rottenTomatoesStatus?: string;
}